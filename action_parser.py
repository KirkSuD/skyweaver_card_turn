import json
import pprint
import xml.etree.ElementTree as ET


def event_reader(data):
    for *_, ev in data:
        yield ev


def parse_action(reader, until=None):
    parent_items = []
    parent_new_content = {}
    for ev in reader:
        evt, payload = ev["type"], ev["payload"]
        if evt == "GameEvent":
            event_payload = payload["event"].get("payload")
            if event_payload is None:
                continue
            game_event_type = payload["event"]["type"]
            action_type = None
            player_action_types = ["PlayCard", "Attack", "Setup"]
            if game_event_type in ["EnterPhase", "ExitPhase"]:
                action_type = event_payload["type"]
                enter_exit = 0 if game_event_type == "EnterPhase" else 1
                if action_type in player_action_types:
                    continue
            elif game_event_type in ["EnterPlayerAction", "ExitPlayerAction"]:
                action_type = event_payload[1]["type"]
                enter_exit = 0 if game_event_type == "EnterPlayerAction" else 1
                if action_type not in player_action_types:
                    continue
            if action_type is None:
                continue
            parent_types = [
                "StartTurn", "EndTurn", "PlayCard", "Attack",
                "ResolveTrigger", "Mulligan", "Draw"]
            if enter_exit == 0:
                if action_type in parent_types:
                    items, new_content = parse_action(reader, action_type)
                content = {}
                if action_type in ["StartTurn", "EndTurn"]:
                    content = {"player": event_payload["payload"]}
                elif action_type == "PlayCard":
                    content = {
                        "player": event_payload[0],
                        "card": event_payload[1]["cardID"],
                        "target": event_payload[1].get("targetID")
                    }
                elif action_type == "Attack":
                    content = {
                        "player": event_payload[0],
                        "attacker": event_payload[1]["attackerID"],
                        "defender": event_payload[1]["defenderID"]
                    }
                elif action_type == "ResolveTrigger":
                    content = {
                        "card": event_payload["payload"]["baseCard"],
                        "effect": event_payload["payload"]["effectType"]
                    }
                elif action_type == "Mulligan":
                    content = {
                        "toMulligan": len(event_payload["payload"]["toMulligan"]),
                        "drawDelta": event_payload["payload"]["drawDelta"],
                    }
                elif action_type == "ModifyCard":
                    modifier = event_payload["payload"].get("modifier", {})
                    if type(modifier) is dict:
                        mod_h = modifier.get("ModifyHealth", [])
                        if len(mod_h) == 2 and mod_h[1] == "Fatigue":
                            # parent_items.append({
                            #     "type": "Fatigue",
                            #     "content": {"value": mod_h[0]}
                            # })
                            parent_new_content.update({
                                "fatigue": mod_h[0]
                            })
                elif action_type == "Setup":
                    parent_items.append({"type": "Setup", "content": {}})
                if action_type in parent_types:
                    parent_items.append({
                        "type": "Trigger" if action_type == "ResolveTrigger" else action_type,
                        "content": {**content, **new_content},
                        "items": items})
            elif action_type in parent_types:
                if action_type == "Mulligan":
                    parent_new_content.update({
                        "mulliganed": len(event_payload["payload"]["mulliganed"]),
                        "drawn": len(event_payload["payload"]["drawn"])
                    })
                elif action_type == "Draw":
                    parent_new_content.update({
                        "allowedPool": event_payload["payload"]["allowedPool"],
                        "fromPlayer": event_payload["payload"]["from"][0],
                        "fromZone": event_payload["payload"]["from"][1],
                        "toPlayer": event_payload["payload"]["to"][0],
                        "toZone": event_payload["payload"]["to"][1]["name"],
                        "public": event_payload["payload"]["to"][1].get("public")
                    })
                    parent_new_content.setdefault("fatigue", None)
                if action_type == until:
                    break
                    # return parent_items, parent_new_content
        elif evt == "MoveCard":
            from_location = payload["from"].get("location", [{"name": None}, None])
            to_location = payload["to"].get("location", [{"name": None}, None])
            content = {
                "fromPlayer": payload["from"]["player"],
                "fromZone": from_location[0]["name"],
                "fromIndex": from_location[1],
                "fromPublic": from_location[0].get("public"),
                "toPlayer": payload["to"]["player"],
                "toZone": to_location[0]["name"],
                "toIndex": to_location[1],
                "toPublic": to_location[0].get("public")
            }
            # parent_items.append({
            #     "type": evt, "content": content})
            if content["fromZone"] == "Hand" and content["toZone"] != "Hand":
                parent_items.append({"type": "Out", "content": content})
            elif content["fromZone"] != "Hand" and content["toZone"] == "Hand":
                parent_items.append({"type": "In", "content": content})
    if until:
        return parent_items, parent_new_content
    else:
        return parent_items
    # if not until:
    #     return parent_items


def to_xml(actions, parent=None):
    return_str = False
    if parent is None:
        parent = ET.Element("actions")
        return_str = True
    for a in actions:
        e = ET.SubElement(parent, a["type"], {k: str(v) for k, v in a["content"].items()})
        if a.get("items"):
            to_xml(a["items"], e)
    if return_str:
        return ET.tostring(parent)


def merge_dict_set(d, new):
    for k, v in new.items():
        d.setdefault(k, set())
        d[k].update(v)


def get_children(actions):
    res = {}
    for a in actions:
        for item in a.get("items", []):
            res.setdefault(a["type"], set())
            res[a["type"]].add(item["type"])
        merge_dict_set(res, get_children(a.get("items", [])))
    return res


# fnames = [
#     # "worker_proxy_store_events",
#     # "worker_proxy_store_events_22040814",
#     # "worker_proxy_store_events_22040815_mulligan",
#     # # # "worker_proxy_store_events_22040820_queue",
#     # "worker_proxy_store_events_22041100_card_4060",
#     # "worker_proxy_store_events_22041407_card_2059",
#     # "worker_proxy_store_events_22041408_card_3095",
#     # "worker_proxy_store_events_22041408_card_3095_2",
#     # "worker_proxy_store_events_22041819_very_long",
#     "worker_proxy_store_events_22041823"
# ]

import os
from glob import glob
fnames = [os.path.split(i)[1][:-5] for i in glob("event_data/worker_proxy_store_events*.json")]
input(fnames)

# children_graph = "event_data/children.png"
# children_graph = "event_data/children.html"
children_graph = None
children = {}
for fname in fnames:
    input_json = f"event_data/{fname}.json"
    output_xml = f"event_data/{fname}_parsed_actions.xml"
    output_json = None  # f"event_data/{fname}_parsed_actions.json"

    print(fname)
    with open(input_json) as file:
        data = json.load(file)

    print("Parsing action...")
    actions = parse_action(event_reader(data))
    merge_dict_set(children, get_children(actions))

    if output_json:
        print("Writing to json...")
        with open(output_json, "w") as file:
            json.dump(actions, file)

    if output_xml:
        print("Convert to XML...")
        xml_str = to_xml(actions)
        with open(output_xml, "wb") as file:
            file.write(xml_str)
print("Children:")
pprint.pprint(children)
if children_graph:
    graph_dict = {k: {i: None for i in v} for k, v in children.items()}

    # import pygraphviz as pgv
    # g = pgv.AGraph(graph_dict, directed=True)
    # g.layout()
    # g.draw(children_graph)

    # import networkx as nx
    # import matplotlib.pyplot as plt
    # nx.draw(nx.DiGraph(graph_dict), with_labels=True)
    # plt.show()

    import networkx as nx
    from pyvis.network import Network
    g = Network(directed=True)
    g.from_nx(nx.DiGraph(graph_dict))
    for n in g.nodes:
        n.update({'physics': False})
    g.show(children_graph)

"""
Children:
{'Attack': {'Trigger'},
 'Draw': {'Out', 'In'},
 'Mulligan': {'Draw', 'Out'},
 'PlayCard': {'Trigger', 'Draw', 'In', 'Mulligan', 'Out'},
 'StartTurn': {'Draw'},
 'Trigger': {'Draw', 'In', 'Mulligan', 'Out'}}

<StartTurn> <EndTurn> <PlayCard> <Attack> <Trigger> <Mulligan> <Draw>
<Fatigue/> <In/> <Out/>

There are overlaps between StartTurn & EndTurn
Sunrise & Sunset triggers happen after StartTurn & EndTurn

worker_proxy_store_events_22040814.json

21130 ExitPhase EndTurn
21151 ResolveTrigger 3067 sunset
21822 EnterPhase StartTurn
22954 ExitPlayerAction EndTurn

68852 ExitPhase StartTurn
68885 ResolveTrigger 20023 Sunrise


fromZone="CardSelection"
fromZone="Limbo"
StartTurn > Draw
Attack > Trigger > Draw
PlayCard
Trigger > Draw
PlayCard > Trigger > Draw
PlayCard > Trigger
PlayCard > Draw
Attack > Trigger
PlayCard > Mulligan > Draw
PlayCard > Trigger > Mulligan > Draw
Attack > Trigger > Mulligan > Draw

<Draw>
    <Fatigue />
    <In />
</Draw>

Trigger*3, (Trigger > Draw > Fatigue, In)*3
(If Trigger has no parent, it's triggered by last action. For example, another trigger)

<StartTurn> <EndTurn> <PlayCard> <Attack> <Trigger> <Mulligan> <Draw>
<Fatigue/> <In/> <Out/>

In <-
None (CardSelection / Limbo)
PlayCard
Trigger <- PlayCard, Attack, None (after StartTurn, EndTurn)
Mulligan??
Draw <- StartTurn, PlayCard, Trigger, Mulligan

Mulligan <- PlayCard
"""
