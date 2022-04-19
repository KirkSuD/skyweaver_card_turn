// ==UserScript==
// @name        Skyweaver enemy card draw turn memorizer
// @name:zh-TW  Skyweaver 對手抽卡記憶器
// @namespace   https://github.com/KirkSuD
// @version     2022.04.19.07
// @description This script remembers which turn the enemy drew the cards by replacing/patching JS.
// @description:zh-TW 這個腳本通過攔截並修改網頁JS程式來抓取資料，記住對手抽卡資訊。
// @match       https://play.skyweaver.net/game/*
// @icon        https://play.skyweaver.net/images/favicon/favicon-32x32.png
// @author      KirkSuD
// @grant       GM.xmlHttpRequest
// @run-at      document-start
// ==/UserScript==

// Please refer to [github: `KirkSuD/skyweaver_card_turn`](https://github.com/KirkSuD/skyweaver_card_turn)

(async function() {
'use strict';

class log {
    // error warn info log debug
    // error: assert  log: dir dirxml trace
    static get prependMessage() {
        return "Skyweaver card turn:";
    }
    static alert(msg, error=null, errorStack=null) {
        let txt = `Skyweaver card turn extension: ${msg}\n` +
            "Disable extension and notify developer if this happened multiple times.";
        if (error !== null) {
            txt += `\nError detail: ${error}`;
        }
        if (errorStack !== null) {
            txt += `\nError stack trace: ${errorStack}`;
        }
        alert(txt);
    }
    static assert(assertion, ...args) { // level: error
        console.assert(assertion, this.prependMessage, ...args);
    }
    static debug(...args) {
        console.debug(this.prependMessage, ...args);
    }
    static dir(...args) { // level: log
        console.dir(this.prependMessage, ...args);
    }
    static dirxml(...args) { // level: log
        console.dirxml(this.prependMessage, ...args);
    }
    static error(...args) {
        console.error(this.prependMessage, ...args);
    }
    static info(...args) {
        console.info(this.prependMessage, ...args);
    }
    static log(...args) {
        console.log(this.prependMessage, ...args);
    }
    static trace(...args) { // level: log
        console.trace(this.prependMessage, ...args);
    }
    static warn(...args) {
        console.warn(this.prependMessage, ...args);
    }
}

try {

log.log("global start");

function cardTurnSubscriber() {
    class log {
        // error warn info log debug
        // error: assert  log: dir dirxml trace
        static get prependMessage() {
            return "Skyweaver card turn:";
        }
        static alert(msg, error=null, errorStack=null) {
            let txt = `Skyweaver card turn extension: ${msg}\n` +
                "Disable extension and notify developer if this happened multiple times.";
            if (error !== null) {
                txt += `\nError detail: ${error}`;
            }
            if (errorStack !== null) {
                txt += `\nError stack trace: ${errorStack}`;
            }
            alert(txt);
        }
        static assert(assertion, ...args) { // level: error
            console.assert(assertion, this.prependMessage, ...args);
        }
        static debug(...args) {
            console.debug(this.prependMessage, ...args);
        }
        static dir(...args) { // level: log
            console.dir(this.prependMessage, ...args);
        }
        static dirxml(...args) { // level: log
            console.dirxml(this.prependMessage, ...args);
        }
        static error(...args) {
            console.error(this.prependMessage, ...args);
        }
        static info(...args) {
            console.info(this.prependMessage, ...args);
        }
        static log(...args) {
            console.log(this.prependMessage, ...args);
        }
        static trace(...args) { // level: log
            console.trace(this.prependMessage, ...args);
        }
        static warn(...args) {
            console.warn(this.prependMessage, ...args);
        }
    }
    let turn = 0, hand = [], rootDivPos = ["180px", "10%"],
        noerror = true, enemy = null, rootDiv = null, viewingCards = null, showingHand = null;
    const cards = n.a, playerOpponentZones = i(44).b;
    window.playerOpponentZones = playerOpponentZones;
    window.cards = cards;
    window.skyweaverWorkerProxyStoreEvents = [];
    // window.cardTurnDebug = [];
    const icons = {
        element: {
            air: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAABFZJREFUaEPtWU1S40YU/p5SGbEb5gSBEwSWiEVgk5FXY04wnhOMzAViLoDMCfCcILCyJxvMAnsZcYLYJ4izQ1SNX+rJMgNyd6tbCCiqpquooqzu1vvez/d+RHjli165/PgB4KUt+KQWiC4u1mnt9gMxNxlYB7CR/wnuBMCMiYYETPjmzXl3f3/mqpAnARCN+3se02cGmi4CMaMHj4+6O42J7blaAYjGPT89dRVcIeyQU//AxiK1AYhGX5sEPsXCVepYE2bvoLv7u7iadtUC4HA0iBiI65C6cMeMiQ+6O42h7u5HAzgc91vMJJp3XHxJjCE8TObAnc97wAYzSezsAXgrlzJ72zpLPApA7jZ/Okj+H8BnTOjYBGp09dcW0bcuQG859fdVMVEZQEaRfvpPBZ8fMpAQUWJLneKiYF4/3m10isrSAhABTSxweNXvMNEfDtpXbZ0x0APxSZlFonF/Azdrs6JMWgAioAqxSCGXEdPfFbSvwysJrBMH4YmrQpQAcvdI4iCUzLmy2qN+D6CPri+z2G/N/8u7lAAWtMjNOGgIEygADMT3leAshCzbkugCVnVQCaA96me8qwKQu48AeMplDWIFQO4+/y4AhCvPHXg/o0wiZMpgpi0saqNfbJATcHYchAdle1cBjPt7xHSRvZR4v5gFLf3/nFO/VWSMXDlChZ/LBMveDzroBu/PTHuNAACcxEEY3b9g4V70m/5SvtTFzvKMpRJk+4xTf9NE52UuIky07QKAiTdLOX2RBKVIK3UnYj7S0bnIVQZANrSPg7D7XXsD+V/tAozreDcUXy9d7dFAXOND6UZgEgfhpm5fmQutmNGcgflLHDRaFkLBJZObYmEVQFZAzSXL3q37jFBSOp/HQWjVhbkAMLmRJg8MuKhFJup0d94fleQBo7ldYunh+/XEoAOg9E+xxDz1P5kCUEW9RWVUqKVmcRC+U7mmupQwNymJEDQIv2p8fcKpv22ivvZoIHlGWabo4keVVJUsJD/mCUe6pKwjqrAmTPypmARzzUsDZMVU99/rBEAOugSZAWDCjASEGS2EdtL6owDUYIUKhtMemepKe2NL6VC41Sms4i5HFnpId4bMW5fYjOvsKg0xOOeBolwOxZc7JMY13/p7pgGBiZqtpxLt0RNYQoSH18LtzxPy06wHUSyt/2tpVKfGPCakmKtKr/eu5i+crkWSL2QYvOxBiu8uFpOK525Wzwa4b24iJpI+oQIQvswHW3fjQgNZTDn1t5z6AVs4d0BATUNWXl43BXjIhN5KcjMMyCp1ZLYAivtkDAjv27o3/56s5uQloHlianD0CdOuNLcO4qrATOf040k74Z2DuG4Q0dXglAgPG6CcVm0+brwoAKXwiiFCmdJexIUUwk8ZFJWNUFRgnhVAzvcy0V5WpVMi7hzvNHplmtY9fxYA7fHXj2BugfEOxDP5MjPHT2dl379sQD0LABtBqu75AaCq5uo69+ot8D82ezlP+6T90gAAAABJRU5ErkJggg==",
            dark: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA5pJREFUaEPtWV1SE0EQ/jqr8dF4AnMDw5tsWUU4AeEEwjvB4QSEEziQvIsnIJyATZW1+AacwHAC46NItq1ekqq47Mzsn6WhMq+Znu2v++tvuieEJV+05P5jBeBfZ3CVgSeTAdVWjegXbTFzB4wGExoEtAQgA9fEmIAwJqKg9pzPdaAnVYAvTaG9ddUh4AMI7VwOMQL2cDT4ooNcdonNhQHsvVNtmuIwt+NJb0sCKQSg66tPAHbKRO6RLUP3L/VB3jNzARCeT3/irHTUTV4yAu8FtvPUR2YA4vz9HS7mhWmJ1C0zghphHDGuZV+N0IoYTXqok9e2KEvBP6tjMyuIzAC66+rCEfkRM/TgUg9tDsZFT1AANoz7GEH/Um9moVMmAA7O33INOy41UW9VM/Jog5nbYDRBscQ2TE4ScHwSagFqXU4AsdpEuDCccu7VsWNLtzg+reGwSNFzDZuuwDgBmKjDjM+DS21Voq6v5PePtkhbw5uBSlYAM76epXzkxqujbYv8zHmR21LLlQUrgK6v5JZMFtsPL0JLf9Vjk2cW4EXAjPqhNt7yRgCx5t/h+6OL00Gdmd23wrRJgejV8cqUbSMAEwU8YE2HOtb3tLXvqx4jLtoq124/1KdpB9oAiJ5vJYxu+qGOO0zT6vpKot+s0nubYNgApPHfykflq9YUuKrS+dlZxu8aAez56irZNhBwdBLqniX6IpulledR3QHXg1Cv5aUQJw1cAP4S/2M3+qFODbaNQksPQJTmzWIWXBmo6vJKoYpRPJ5wEa+rUyK8X4yG9OqmYprv6/pKbmhrz59XpYrKaKqiLM1FVrKVkCy8zBtp0/5CrYQcZmjmJl6Etf++mRMApmEmy9xalSKVaqctWZCfTvuh3nX0RVJHugSdrK2LfNs5kTlGyqFXx65rpLwn9JKKlqU+XNHPBEA27ftKszwfpq+xB2zbWmwxi2djQmf2siHDvHS1xkKvbKhf0Pe07nQR0pBrOHYN4fv+gTwAK9cTjW0KS3QHWZIJzGRVQPzRXqRYj8EYMmFCTAERGhG4RQ8zgoyGrlnBOW8XAhDT4GHMlEHH/CiVLR6mXSOvjk7WV7nMNZD8mqMmCkHIyvnk4U4VMnkzUycZbspmY8Q19Fy1Y/KjMID5gSWAlHJ8/v3SAOYHzeqjw4w2UVyoIpXzgr8BMGGWv5gQeHUM8/DcxsnKABQifgVGKwAVBLHUEasMlApfBcZLn4Hf9w+yQIWbURMAAAAASUVORK5CYII=",
            earth: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA+VJREFUaEPtWdtV20AQnVnlH1KAhaggtsi3ZVeAqSCmgpAKMBWEVBCnAkQFtvwdZKeCGNEA/o92cmYtEVle64FXOXAO+7uvuXvncXcX4ZU3fOX2wxuAIgbbE6e96C8XTbLcGAPtiXMohPwNBH7Yi86bAtEIADbeEnJCAG1lOMKXsBtdNwGiEQBuYI8A4DJrsJSi04Q7GQfQnjiOcp1cI6TpvPvQN82CcQCdwPYR4FRnqJCi/7O/nJoEYRTArtNPDSaA27kXDV4sAHdmXwDB1yIDpRTvF/3loykQRhlwp60FIH4oNA7pPOw+jF8mgMCmMsNMu5ExBj5OnJ4UclIGAACD0LvvlY+rNkILwJ21hkh4IFEqGUDxu1VZDj+ZtQZEeFNl29CLSg+OZQhafw54PUGiTUgrnevpAQRHUwDycsY8AuEUkfxYitt8IPKGQkhOkWrTgrYKvegw359U71MiHAASM5Qbo2euDoDNPQnGksTVor9cph0KBEofEI60AIh+SbKGWTZV6kV5CQjDYtymAfzbbRR60VUGxKHAeLqVjdbG97LMuYHNcoNlR4VWC4DNwutzhVXVEJYJFFtnqXFKiXL8pEwQ3EsSLK1V/ud+tOIbJKwTzFehF22B1bpQnYDMgFwmgi01kmNizv1ZIfcks7d8vMSBkM7uug9+fpQWQLIJ+3ZZQG6shwCLWIp+etKqMgNAKqW3ZHZVigG0gc/Td6azTmCPEeBT9T2SkYR+2Ls/081zp0c3gFRbCxHAj7kXaYN8J4DnsqBORUP3M92Sl1tJKZxd+qmwoOyxaT4e+HrJ8eDUZbRMgpdWRK7KQMhZqVY8QEa0JWt8r2n8CpAuyoRfKYAk7Tko5KhmTCxDLzrm+W5g8w2t8umzz5MUo2yR3AW+EoBMkXKEFfe43CMA5/BCVjh98tw0nRYwsCIAJVNkbE2rGJ6uVQtA3gBWoLGQQwTgzKID8y2ZoyuKbLRvSTHe55q5F4AMMxyknPM3XiK4LqhKnT6vrCesAOBaSnFt4mZmBMCGi2Hs77yVrfXQoI6LlAW+UQCpzqkq5sqMq9JvHEAC4kkHpUZIKY5NnryRIC46oawUKZICVU65aEwjDKjcvy6A6+Jl+CUiC6gxANlLfpkc2IeFxgBkGdCJu32M/i8MuMHGrU57mzIBojEGTgJ7nhYwLmh3XqRkhenWCIDkiUVdJzNp9HX8D7DButtcU6nUOAO602+ymBkH0Jm1JrueS5r4pTEKoMr/gOmiZgxA8jvDgbv17pnLPI/JO9HTk+Q+mckYgOQBYP2tWtIQaaF7pCqbp+s3BuA5m5uY8wbAxCnus8ZfGAPrQP9Y5vAAAAAASUVORK5CYII=",
            fire: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA8FJREFUaEPtmf1NGzEYxl+TnESxUcMEhQlKJyhMUJgAmKAwQekEhQkKE0AnACZoNmg7AUHYFOmSuHoi+3RxfGffFwUJ/4Wwz35/fj/82GH0wht74fbTK8D/9mDrHlArKztL0+nwzePj76eAax3gdjAYJGk6JKKrNEmO1kajUZcgrQPA2HshtpjWV0QE44+EUmddQXQCAGMl5/DCe2P4WVfe6BLghIg+53Z+2JtMdtvOjc4A7oU4Zlp/cUJnmCbJdpt58dQA4GkVokuAS6b1p4LkPRVKHbaR2J0AmFJ6W2ZgbzLZaCMfOgEoiP85Hs3Yj1Upd5p6oXWAv8vL65Ne7ycRDULGCaUar994AtfIeyEumNZRO6sZ216V8lpyvklEe0KpoxC0298IALGeL4nQQZqxi1gjNGNfV6U8NgcftNOVUOog9nuMqwVgduxEKLVlFzOJ+ysmdOw3DsA1EX3M/y8GpDKA5HyfiL4T0blQCn/PWpXQKQMwfR+EUpAiwVYJIGc8Ma13+cPDpTHeirfggs6AAyv0JOdIfOQC2rVQajtmsmgAN75tApr4hfLMwilmYYyxZ4GpXAi/rOXnL5svCsBXGp0Kgt2r2v4IpdaNB326aS5EiyaPApCcQ8/v5SexISQ5d1VnLMhMTpiC4NuAkVBqLTRZEKBEFlgDZtUjtJDbj/CZ9Ho47BB+3kMvJoyCACW1fZQmyUaSppVKpwE5JyLsOs6AshMbtzl4uLAFAQK6BqG1UcMDuGoGpQYRBVVrEEByXitEqoZUwfib/GHpG/MKELHTI83YKdMa50TVZH82HphdI/vj8SbTGnnzLgIcQ54NQCYPTFlGXtknlzKWVgAWDrHI3VsYlibJGuR37vUu5IngaRyTxLh8f6trtPNdJt5i7g4x0joGAAqxjtbxMWcA6HRe7xbGt3ISm4VwWwq5O+gk16C8PPd8fCeUCh52QQ8YgCLBdkdEyJH8E2IRyIJBJUIOcwTjH4OiAHx63Vh5kybJTpKm8NDbgAvmwseOlZxr33cx4RMNgIEFmmhW5kxCwhNFEIWaRnIOXeR+FyyfFjrKAxhcUL+zhUw/1CXuydagG83YMZ5OirwjOccL3lysV3m1iwYwuYCKBGMyA0NiK5TZnhDyhlrRPJUAfBBNXtdyv+RY+6ISNw9TGcCFiE023w46ZTR4efHNUQvA5kR/PD5jWuPumr0PhUIm3y85x22Oacb2y/KkbM7aAHZShEGdxVG5pktLm+N+/6TJLzaNAarseBdjXwG62NUqc754D/wDu9zkQJHAxLcAAAAASUVORK5CYII=",
            light: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA+hJREFUaEPtWWFOE0EU/mZqiP8sJ5BSTGAxsZ5AxguAJxBOIJwAOAG9gfUElgsw5QRiogsJFPAEwj81dMe8dmvG3Z2dN7WLacIm/dU3b94375vvvbcrMOOPmPH48QDgf2ew0gxc6pWOgbxpqq/bVQGtDMCVXl5IIK8ocImk0VBn11WAqAxAX0cfAWxQ0ALmw6I63ZwZAOf6+ZpEou2Aq8pCJRm40CtaQKzZAAxMb0mdqmlngQXgSrfqMD9eNF6fHfsCKDr98ZoEUj1TX3o+H1dHy68gHn9uqJMbny0LgBUUOewmBt1nr+PDIudFpz+2K8vC+VG0LsXwztCvLoGXDRWfTAUAOenriIJ/YjnMgbnQ0aYA3pdtamchG7S17rap4rov+JFAMJ+Rpou3DvMhGADE+wWPSzpVktShQhU9IarFBnChVzYEBElj5Y+BebOkTulAvA8bgING3g0mMGDTJ4hCZOyh0QSx5peE0CcYAJdGFMQAtc4j3F0Dsj6AWRCQa4ChamwLQQ5BCH2CAaQ0MmWXT8DsufoeqicGP9slYhBEn4kAXOqoa4D1AhD7TRXvcXjkklsBHC6q2KlOxYrF2TG1SQvaAYCWvcwAx0sq/qt18Lnt69U2YN5l7E4SyB1OtR6vY6kQBS4w2M32N6mTW4mkFdouE50S/KKa8DQLliq2QW2fA6QUAPX0A4j3jsCH+06S9nHAjiz8wUNAajBbZYdTCCAdRnYBcHp4NvezJ13W+GVsOxLJfhGQHIC+Xj0ADHsE5HaYRXciAMB4eaep4i3bVw5AaLG6TwBFRc5JIQPZdshl5jDNTlOdtn2qU/R/X69sA4JUrfShwF31pfQSj9Qn2RPAK9cOk0jo2Jcv2+S7BmyXzQUBMuoGIjE3z5me7ENIheITDS95GcWxgdz7ZxnNOk57IaJLVrtzl8tHC8fk9i2B3OQEHlTI7GBcrYQBtpZU3PEFTv/3dUQSnWs7JqkpLArZQfV19L0o7alNR2Jux0UnTmEMpWMQAGY7PRwvDUSvZgbDt3GJEC2AfqOBvSxLIZlMOwFO0kc2PtXge3JbhtIoKAMe+kwj/qGPporZcbENmfSZCoiQqYwNwEOfWwH0zOiVygsPim9i2C4Lug+F42XIXMwGUECfWwHTTYDu+BUIpzmzT5eyKoGNAjA3TRXPc9LJAmAFlgs6X+yinqv1KGs7LDA02T3lNoksADQ93eGuxamQU3m5q6MWMHfNaU9YADiptG0udD4L/9L0le1fCQD789J4cy4lQg+rEgDZohdanEJAVAZg5j/yjbrO1bZAUq/qA19wLxSS2vuyrYxCDwCYJzDzGfgNk5zfQBD4wqoAAAAASUVORK5CYII=",
            metal: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAytJREFUaEPtmM1RGzEUx//ygWvoIE4FsSuIOWKZCa4gUEFQBUkqUFIBTgUmg2WOkApiKgjpAK46WBnBLrMx0urpYwPMoKsl7/u9L/2fGJ75Ys/cfrwAPHYEO43AfC63t7ZwzLmYdgXaKYBS8heAAYAvnIvPXUB0BqCU/ArgY8PoIediVRqiEwCl5AGA4w1jr7TGcDoV1yUhigMoJW3KnAPYdhh6UroeigJURWvzvt/i5UPOxaxUFIoCKCXnAPYDxl33ehju7oqrEhDFAJSStst8Ihq14lwMiXtbtxUBOD2Vo17vNu9j1jfOxVHMAdfebICzM9lfr2Hz3lW0rfat19jZ2xMXORBZAFXRWs/bzuNal8Zgxhik5/drrfEmp7VmASglba+3Pd+xzI3WrG+NU0qeAHjv3GVwMZmIndQoJAN4Lqt7O5rpcRcpcwWwVx4IMZkIe3NHrySA6rKyee/2vcEDgwiFniQ1ogGqvP/tK1rG8H08Fs60cuijpgOSpEY0wGIhzxnDyFe0WmPUVpRKSSvo3nrOzzgXhzF5FAXQ7kFz0+uxQeiGvWu7ZuWrB8YwHY+FLXrSIgOEijbmw4H/ipIaJICAwrSeih5Ylks5MwYfPG4mSw0qQD1Zub73g3MREnAPzlXNwNbDaw8EySlUgDahttIaOym3aUC9XnIufDf8PTMJwO4u3T3a1au5AdiIMoKSAUp2j+VS7hsDOzs4V0xDIANUUXDNurURpO5BUK9RMjsKwFqa0z0I6vUn58J3SbqjRbotGptyuke7esUfrTGIbQbREahSyXYHr5hzDSqLhTxqmQvs3/4fMVcHI2DQP4MKQYkmv1QkRaCGUEracfCdJw1v34By1CslvbMAKIMKY7dywTtyhtRrCCILwP45IT08NtDUa+cAVVFvPuSGvosSLxL2I9kRaNRD26CyCUQSakEvFAYYAObCN6g0jElSr17ZQaGk7gkNPQAuc4t205ZiKdRIJc8bEF1hUh1WtAbqj7ZIjeTLqg2oeAQ8UiNKYT5qBBqpVE9x0QrzSQBUkTjRGgexCvPJAMQYkrq3kxpINSbl3AtAitdKnvkL2Hd1QMAV4YcAAAAASUVORK5CYII=",
            mind: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAzxJREFUaEPtmcFxWjEQhn8xk+EY1IFdQZQKYioIqcC4gtiXGE7BJyAXOxWEVBBSQUgFERUkrkD4mIuV2UHYD/wkrcR7EGa8M+9i3tPut7vaXckCBy7iwO3HM8C+I7h1BEbKvAVwAkC5p1WA0gAW9AhAC4HZC4v5hZb0t0okG2CszKkFBgCOMiyZWOBrX8tZxrdrnyQDfFJG3QNfnLe31T+zwFlfyz+5CyUBDJU5EcA3AMU0ydW9+o7S6+xSy2nOQmwA5/kfFRv/YLMA3uVAsACGyhwJ4FddxjuKRQNof9CSNj5bWAAjZcjzVGl8cmeBaQOY3gN6ldME3gBoz3QE0AHwMmLZrKdlm209EG9kLu8JwCefm8AgVhqvlWn9XVat9yEDLXCcsqmjERgpQ6lDNf6JuAoySfHYUJmuWFaxUnHltctdMwjgvGbKFhPAxaWWN1xFxffGypxb4NrjlJ99LUPpuvZZEMDnLQskKSkzdKjMTABvyn7raRnNjNV3MYCBAD5uKslJnc01QqmUsg+CACNlqLnQrLMmKQp8KeZK829PGrW5Y0YsAqVhTglxaI+MlLEeAHYlygKoOwIpDooBTARwuus9UCVA6SYGkNwxN50Q6u4WuOprSU0vKsEIjJXp2OX0+UTq6gMrRRZgbeTsRkaKcspprBMXPKV7Wr6OhSDaMHyltLDwTRO4Ys5C1FPOY0YVohBNpSgAY5gjfXTGpZ4xtcC8OI0K4BWWkyg9qQehRRM4DjknCkDWhdo+15u578X2GgvAncZoKt2ZWOAWAJ2VJ30tvRMvC4CsDk2QdVBxSykbwKVSaWM7GIBd7odaIkAA7pBDF1JUXeqSOwF0ObcUSSm0sjbUoasg4nqfdGUBDJXxzUhV2E8dPtrAVor+VwDWHJQdAcZ4sVUkUs4buRHwHsi3snw5IN72tWTfeGcBhO6KGABz+zjQkaF0bdmyj3dPwc67uX4uQOlZlmE8vfK9pyUNdpVIMgBzOvUal1JhOITJACNl6DYueL8ZUpxzCAqtlwNAdznsTVaSs1n/B/BBJAFUMVbvNYW2TR/y4r4Btkoflwb7rUKcyrDLd5L2wC4N4+p6BuB6qq73/gGrMltASZH50QAAAABJRU5ErkJggg==",
            water: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA1hJREFUaEPtmVFO20AQhmeMlDwWXhrnqeQEhRMAJ2h6giamiuGp9ASlJyh9oo6Kk56gcALgBIUTNH2K6QvhsVW1U02wJZOs1971GhQpfvVmPd/O7Mw/E4QFf3DB7YclwFN7sFIPvD0eb/9bWZkMe8+vqgKtFKAb3AzZ8IHf6CwcQOd4vO44+JMNF4Jaw/3mqAqIyjzgBeNDAPxwbzR9DP3m4cIAdAa3q87fP3z6q7HRk9B31xYGwOuPO0A4eGAwUjfsNad3wuZTSQh5QcSnvz5j6Cj03ZZN43kv6wDS00+srsAL9gHkp58gWPeCVQAviA4A4FNOmLwPfffIVihZA5BkniwbJ6JWbw27axMbENYAHub9PNPs1QUrAHHV/ZHK+3kEEyFo00Z1tgLAmgeB3uRZnX5PgN9saKTSAKw4hYPnMuMR4YxoWo23ZO8FOptllWppgG4/OkeCbamBgqaFKxF1s2sI4WLQc3d0PDe7thSAqmgRwefBnstpFVQhhoCvT/zGqSmEMUCcNvnizkoGtuVO1OrrSaqM17KcfiYxdCRq9U3TtGoMkJM254qVer15WjUCyCla16HvbshCwgsi9sILyTvj4mYEoIppR9DO1/3mhQxAlbFM06o2QLpVnMsICGcnPbetupBeEDGcPK0atJ7aAKrTL9L7dvq/NxwSfPnnHhMvaAN4QXQrkww6H1ccgnbrqQWwG9y0Ceh7VtEqqm2UYahZF7QAslKhzukn8Lv96JQIXkkCSWuCoQkgv4Am1VThzcvQd6XSRKq3dEp4VgZRpc6s/RUpdQmQ6ZTMHG4wbVAIweo80P0SHSHCO5kg0535ZMyOtMeQWpdYlUZBwwuq6YXufdIC4JNXCDIAwmG41+jmSAkeu0z7BMnzK/RdmTzP3NIAID11nt8XAa4I6PS+22peThua/niLuzYEbBOAVKnGO2nPjLQBYi/wPy4vdVJwgbValzfZzwggFmSsKmUdVgFb55bcCUEbRaVI+tdGALyBRYg7gc626XTCGCAFwXNOqb4v4IpLUau3Tfth3r8UQGJgXJT4LyRZuyjNNgh4UGYaUeoOZJ0shxUK0UGcZhoeaCUX/RoAJkRwRY4zNA2X0mKuQEg8+hIrIfToVqc+uAR4ytPnb/8HnnGdQDXwaSMAAAAASUVORK5CYII=",
        },
        type: {
            spell: "data:image/png;base64,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",
            unit: "data:image/png;base64,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"
        }
    };
    const localStorageKey = "skyweaver_card_turn_addon_saved_hand";
    let savedHand;
    try {
        savedHand = JSON.parse(localStorage.getItem(localStorageKey));
    } catch (error) {
        savedHand = null;
    }
    const savedDataKeys = "turn hand rootDivPos";
    if (savedHand && savedDataKeys.split(" ").every(k => k in savedHand)) {
        log.log("load state from localStorage:", savedHand);
        ({turn, hand, rootDivPos} = savedHand);
    }
    function deepCopy(x) {
        return JSON.parse(JSON.stringify(x));
    }
    /* StartTurn EndTurn PlayCard Attack
    Draw Mulligan Trigger Fatigue
    [Trigger] [Mulligan] Draw [Fatigue]
    StartTurn  ->  imply Draw  // BUG: start turn doesn't mean draw, may just fatigue
    PlayCard -> show the card (& target)
    Attack -> show attacker & defender
    Trigger before Draw -> show Trigger card
    Mulligan -> show Mulligan
    Fatigue -> show Fatigue

    StartTurn: Phase  EndTurn: PlayerAction, Phase
    PlayCard: PlayerAction  Attack: PlayerAction, Phase
    ResolveTrigger: Phase  Mulligan: Phase
    Draw: Phase  Fatigue: Phase: ModifyCard: modifier
    "type": "MoveCard"
    not use Draw because Draw may not include things like field -> hand

    StartTurn, EndTurn: player
    PlayCard: player, cardID (& targetID)  Attack: player, attackerID, defenderID
    ResolveTrigger: baseCard, effectType  Mulligan: mulliganed.length
    MoveCard: from, to: player, location, index
    Fatigue */
    const getE = id => document.getElementById(id); // abbr
    class myActionParser {
        constructor(callbackFunc) {
            this.callbackFunc = callbackFunc;
            this.events = [];
            this.lastAction = null;
        }
        handleEvent(ev) {
            this.events.push(ev);
            const act = this.parseAction();
            const res = {action: deepCopy(act)};
            if (act !== null && act.length === 1) {
                log.debug("handleEvent act:", act);
                res.lastAction = deepCopy(this.lastAction);
                res.callbackResult = deepCopy(this.callbackFunc(act[0], this.lastAction));
                this.events = [];
                this.lastAction = act[0];
            }
            return res;
        }
        parseAction(until=null, currentIndex=[0]) {
            // from action_parser.py parse_action
            const parent_items = [];
            const parent_new_content = {};
            // log.log("parseAction currentIndex:", currentIndex);
            while (currentIndex[0] < this.events.length) {
                const ev = this.events[currentIndex[0]];
                currentIndex[0]++;
                const evt=ev.type, payload=ev.payload;
                let content = {};
                if (evt === "GameEvent") {
                    if (!("payload" in payload.event)) {
                        continue;
                    }
                    const event_payload = payload.event.payload;
                    const game_event_type = payload.event.type;
                    let action_type = null, enter_exit;
                    const player_action_types = ["PlayCard", "Attack", "Setup"];
                    if (["EnterPhase", "ExitPhase"].includes(game_event_type)) {
                        action_type = event_payload.type;
                        enter_exit = (game_event_type === "EnterPhase") ? 0 : 1;
                        if (player_action_types.includes(action_type)) {
                            continue;
                        }
                    }
                    else if(["EnterPlayerAction", "ExitPlayerAction"].includes(game_event_type)) {
                        action_type = event_payload[1].type;
                        enter_exit = (game_event_type === "EnterPlayerAction") ? 0 : 1;
                        if (!(player_action_types.includes(action_type))) {
                            continue;
                        }
                    }
                    if (action_type === null) {
                        continue;
                    }
                    const parent_types = [
                        "StartTurn", "EndTurn", "PlayCard", "Attack",
                        "ResolveTrigger", "Mulligan", "Draw"];
                    if (enter_exit === 0) {
                        let items, new_content;
                        if (parent_types.includes(action_type)) {
                            const recursion = this.parseAction(action_type, currentIndex);
                            if (recursion === null) {
                                return null;
                            }
                            [items, new_content] = recursion;
                        }
                        if (["StartTurn", "EndTurn"].includes(action_type)) {
                            content = {player: event_payload.payload};
                        }
                        else if (action_type === "PlayCard") {
                            content = {
                                player:event_payload[0],
                                card: event_payload[1].cardID,
                                target: event_payload[1].targetID ?? null
                            };
                        }
                        else if (action_type === "Attack") {
                            content = {
                                player: event_payload[0],
                                attacker: event_payload[1].attackerID,
                                defender: event_payload[1].defenderID
                            };
                        }
                        else if (action_type === "ResolveTrigger") {
                            content = {
                                card: event_payload.payload.baseCard,
                                effect: event_payload.payload.effectType
                            };
                        }
                        else if (action_type === "Mulligan") {
                            content = {
                                toMulligan: event_payload.payload.toMulligan.length,
                                drawDelta: event_payload.payload.drawDelta,
                            };
                        }
                        else if (action_type === "ModifyCard") {
                            const modifier = event_payload.payload.modifier;
                            if (modifier) {
                                const mod_h = modifier.ModifyHealth ?? [];
                                if (mod_h.length === 2 && mod_h[1] === "Fatigue") {
                                    Object.assign(parent_new_content, {"fatigue": mod_h[0]});
                                }
                            }
                        }
                        else if (action_type === "Setup") {
                            parent_items.push({type: "Setup", content: {}})
                        }
                        if (parent_types.includes(action_type)) {
                            parent_items.push({
                                type: ((action_type == "ResolveTrigger") ? "Trigger" : action_type),
                                content: {...content, ...new_content},
                                items: items});
                        }
                    }
                    else if (parent_types.includes(action_type)) {
                        if (action_type === "Mulligan") {
                            Object.assign(parent_new_content, {
                                mulliganed: event_payload.payload.mulliganed.length,
                                drawn: event_payload.payload.drawn.length
                            });
                        }
                        else if (action_type === "Draw") {
                            Object.assign(parent_new_content, {
                                allowedPool: event_payload.payload.allowedPool,
                                fromPlayer: event_payload.payload.from[0],
                                fromZone: event_payload.payload.from[1],
                                toPlayer: event_payload.payload.to[0],
                                toZone: event_payload.payload.to[1].name,
                                public: event_payload.payload.to[1].public ?? null
                            })
                            if (!("fatigue" in parent_new_content)) {
                                parent_new_content.fatigue = null;
                            }
                        }
                        if (action_type === until) {
                            // log.log("parseAction: return:", parent_items, currentIndex[0], this.events.length);
                            return [parent_items, parent_new_content];
                        }
                    }
                }
                else if (evt === "MoveCard") {
                    const from_location = payload.from.location ?? [{"name": null}, null];
                    const to_location = payload.to.location ?? [{"name": null}, null];
                    content = {
                        fromPlayer: payload.from.player,
                        fromZone: from_location[0].name,
                        fromIndex: from_location[1],
                        fromPublic: from_location[0].public ?? null,
                        toPlayer: payload.to.player,
                        toZone: to_location[0].name,
                        toIndex: to_location[1],
                        toPublic: to_location[0].public ?? null
                    };
                    if (content.fromZone === "Hand" && content.toZone !== "Hand") {
                        parent_items.push({"type": "Out", "content": content});
                    }
                    else if (content.fromZone !== "Hand" && content.toZone === "Hand") {
                        parent_items.push({"type": "In", "content": content});
                    }
                }
            }
            if (until) {
                return null;
            }
            else {
                // log.log("parseAction: return:", parent_items, currentIndex, this.events.length);
                return parent_items;
            }
        }
    }
    function actionHandler(action, lastAction) {
        log.debug("actionHandler:", action);
        if (action.type === "Setup") {
            // new game, reset state
            log.log("new game");
            turn = 0, hand = [];
        }
        else if (action.type === "StartTurn" && action.content.player === enemy) {
            log.log("start turn", turn);
            turn++;
        }
        return recursiveHandHandler(action, lastAction);
    }
    function findCardBase(i) {
        // log.log("findCardBase:", i);
        if (i === null) {
            return null;
        }
        for (const zone in playerOpponentZones) {
            for (const item of playerOpponentZones[zone].items) {
                if (!item.has("cardInstance")) {
                    continue;
                }
                const cardInstance = item.get("cardInstance");
                if (cardInstance && cardInstance.id === i) {
                    return cardInstance.base;
                }
            }
        }
        log.warn("findCardBase:", "not found:", i);
        return null;
    }
    function recursiveHandHandler(action, lastRootAction, ancestors=[], result=[]) {
        // log.debug("recursiveHandHandler:", action);
        if (action.type === "In" && action.content.toPlayer === enemy) {

            const newHand = {
                turn: turn,
                player: null, action: null,

                fromPlayer: action.content.fromPlayer,
                fromZone: action.content.fromZone,
                fromIndex: action.content.fromIndex,
                toPlayer: action.content.toPlayer,
                toZone: action.content.toZone,
                toIndex: action.content.toIndex,

                pool: null, fatigue: null,
                toMulligan: null, drawnMulligan: null,
                trigger: null, effect: null,
                attacker: null, defender: null,
                play: null, target: null
            };
            for (let i=ancestors.length-1; i>=0; i--) {
                const item = ancestors[i];
                if (item.type === "Draw") {
                    Object.assign(newHand, {
                        pool: item.content.allowedPool,
                        fatigue: item.content.fatigue
                    });
                }
                else if (item.type === "Mulligan") {
                    Object.assign(newHand, {
                        toMulligan: item.content.toMulligan,
                        drawnMulligan: item.content.drawn
                    });
                }
                else if (item.type === "Trigger") {
                    Object.assign(newHand, {
                        trigger: item.content.card,
                        effect: item.content.effect
                    });
                }
                else if (item.type === "Attack") {
                    Object.assign(newHand, {
                        player: item.content.player,
                        attacker: findCardBase(item.content.attacker),
                        defender: findCardBase(item.content.defender),
                    });
                }
                else if (item.type === "PlayCard") {
                    Object.assign(newHand, {
                        player: item.content.player,
                        play: findCardBase(item.content.card),
                        target: findCardBase(item.content.target),
                    });
                }
                else if (item.type === "StartTurn") {
                    newHand.player = item.content.player;
                }
            }
            if (ancestors.length === 0) {
                if (["CardSelection", "Limbo"].includes(action.content.fromZone)) {
                    newHand.action = action.content.fromZone;
                    newHand.player = action.content.fromPlayer;
                }
            }
            else {
                newHand.action = ancestors[0].type;
                if (ancestors[0].type === "Trigger") {
                    if (["StartTurn", "EndTurn"].includes(lastRootAction.type)) {
                        newHand.action = lastRootAction.type;
                        newHand.player = lastRootAction.content.player;
                    }
                }
            }
            if (!["StartTurn", "EndTurn", "PlayCard", "Attack", "CardSelection", "Limbo"].includes(newHand.action) || newHand.player === null) {
                log.warn("recursiveHandHandler:", "weirdHand:",
                    newHand, action, lastRootAction, ancestors, ancestors.length);
            }
            // log.log("recursiveHandHandler:", "newHand:", action);
            log.log("Skyweaver card turn:", "draw",
                action.content.fromPlayer, action.content.fromZone, action.content.fromIndex,
                "->", action.content.toPlayer, action.content.toZone, action.content.toIndex);
            addHand(newHand);
            hand.push(newHand);
            result.push(["addHand", newHand]);
        }
        else if (action.type === "Out" && action.content.fromPlayer === enemy) {
            log.log("Skyweaver card turn:", "play",
                action.content.fromPlayer, action.content.fromZone, action.content.fromIndex,
                "->", action.content.toPlayer, action.content.toZone, action.content.toIndex);
            removeHand(action.content.fromIndex);
            result.push(["removeHand", action.content.fromIndex]);
        }
        else if (action.items) {
            ancestors.push(action);
            for (const item of action.items) {
                recursiveHandHandler(item, lastRootAction, ancestors, result);
            }
            ancestors.pop();
        }
        return result;
    }

    function addHand(newHand) {
        log.debug("addHand:", newHand);
        // const isGift = !['CardSelection', 'Deck', 'Hand'].includes(newHand.fromZone);
        const [special, ,] = getHandInfo(newHand);
        const inlineStyle = special ? ' style="text-decoration:underline"' : "";

        const spanHTML = `
            <span title="from ${newHand.fromZone}"${inlineStyle}>
                ${newHand.turn}
            </span> `;
        const temp = document.createElement("template");
        temp.innerHTML = spanHTML.trim();
        const newSpan = temp.content.firstChild;
        newSpan.addEventListener("mouseenter", e => {
            showHand(e, newHand);
        });
        getE("cardTurnTurnText").appendChild(newSpan);
        newHand.domElem = newSpan;
    }
    function removeHand(idx) {
        log.debug("removeHand:", idx);
        if (showingHand === hand[idx]) {
            hideHand();
        }
        hand[idx].domElem.remove();
        hand.splice(idx, 1);
    }
    function getHandInfo(h) {
        function playerName(pid) {
            if (pid !== 0 && pid !== 1) {
                return null;
            }
            return (pid === enemy) ? "Enemy" : "Player";
        }
        let special = !["CardSelection", "StartTurn"].includes(h.action);
        const fromPlayer = playerName(h.fromPlayer);
        const toPlayer = playerName(h.toPlayer);
        const player = playerName(h.player);
        let infoText = `T${h.turn}   ${fromPlayer} ${h.fromZone} ${h.fromIndex}` +
            `  >  ${toPlayer} ${h.toZone} ${h.toIndex}` +
            `\n${player} ${h.action}`;
        if (h.pool !== null && h.pool !== "Anywhere") {
            special = true;
            infoText += `   Pool: ${h.pool}`;
        }
        if (h.toMulligan !== null && h.drawnMulligan !== null) {
            special = true;
            if (h.toMulligan === h.drawnMulligan) {
                infoText += `   Mulligan: ${h.toMulligan}`;
            }
            else {
                infoText += `   Mulligan: ${h.drawnMulligan}/${h.toMulligan}`;
            }
        }
        if (h.fatigue !== null) {
            special = true;
            infoText += `   Fatigue: ${h.fatigue}`;
        }

        const infoCards = [];
        if (h.play) {
            special = true;
            infoCards.push(["Play", h.play]);
        }
        if (h.target) {
            special = true;
            infoCards.push(["Target", h.target]);
        }
        if (h.attacker) {
            special = true;
            infoCards.push(["Attacker", h.attacker]);
        }
        if (h.defender) {
            special = true;
            infoCards.push(["Defender", h.defender]);
        }
        if (h.trigger) {
            special = true;
            infoCards.push([`Trigger: ${h.effect}`, h.trigger]);
        }

        return [special, infoText, infoCards];
    }

    function showHand(e, h) {
        log.log("showHand:", h);
        const [, infoText, infoCards] = getHandInfo(h);

        const cardTurnHoverHand = getE("cardTurnHoverHand");
        cardTurnHoverHand.children[0].innerText = infoText;
        cardTurnHoverHand.classList.add("cardTurnHandClosed");
        if (infoCards.length > 0) {
            cardTurnHoverHand.classList.remove("cardTurnHandClosed");
            let h = "";
            for (const c of infoCards) {
                if (c[1] === "Hero") {
                    h += `
                        <div>
                            <p>${c[0]}</p>
                            <div class="cardTurnImgContainer">
                                <p>Hero</p>
                            </div>
                        </div>`;
                }
                else {
                    h += `
                        <div>
                            <p>${c[0]}</p>
                            <div class="cardTurnImgContainer">
                                <img src="https://assets.skyweaver.net/latest/full-cards/4x/${c[1]}.png">
                            </div>
                        </div>`;
                }
            }
            getE("cardTurnHoverHandCards").innerHTML = h;
        }
        cardTurnHoverHand.style.display = "unset";
        showingHand = h;
        let x, y;
        if (rootDiv.offsetLeft + rootDiv.offsetWidth/2 < window.innerWidth/2) {
            // rootDiv @ left half
            x = rootDiv.offsetLeft;
        }
        else {
            // rootDiv @ right half
            x = rootDiv.offsetLeft + rootDiv.offsetWidth - cardTurnHoverHand.offsetWidth;
        }
        if (viewingCards) {
            y = getE("cardTurnTurnText").offsetHeight;
        }
        else if (rootDiv.offsetTop + rootDiv.offsetHeight/2 < window.innerHeight/2) {
            // rootDiv @ top half
            y = rootDiv.offsetTop + rootDiv.offsetHeight;
        }
        else {
            // rootDiv @ bottom half
            y = rootDiv.offsetTop - cardTurnHoverHand.offsetHeight;
        }

        x = Math.max(0, x);
        x = Math.min(window.innerWidth-cardTurnHoverHand.offsetWidth, x);
        y = Math.max(0, y);
        y = Math.min(window.innerHeight-cardTurnHoverHand.offsetHeight, y);
        cardTurnHoverHand.style.left = x + "px";
        cardTurnHoverHand.style.top = y + "px";

        e.target.addEventListener("mouseleave", hideHand);
    }
    function hideHand() {
        getE("cardTurnHoverHand").style.display = "none";
        showingHand = null;
    }

    class cardFilter {
        static capitalize(s) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        static toCapitalizeObject(s) {
            const res = {};
            for (const i of s.split(" ")) {
                res[i] = this.capitalize(i);
            }
            return res
        }
        static get zones() {
            return this.toCapitalizeObject("Deck Hand Field Graveyard");
        }
        static get schema() {
            return {
                columns: [
                    "inPlayerZone outPlayerZone prism element triggers".split(" "),
                    "inEnemyZone outEnemyZone cardType traits manaCost".split(" ")
                ],
                areas: {
                    inPlayerZone: { text: "+ Player", values: this.zones },
                    outPlayerZone: { text: "- Player", values: this.zones },
                    inEnemyZone: { text: "+ Enemy", values: this.zones },
                    outEnemyZone: { text: "- Enemy", values: this.zones },
                    prism: {
                        text: "PRISM",
                        values: {str: "Strength", wis: "Wisdom", agy: "Agility", hrt: "Heart", int: "Intellect"}
                    },
                    cardType: {
                        text: "CARD TYPE",
                        values: this.toCapitalizeObject("Spell Unit")
                    },
                    element: {
                        text: "ELEMENT",
                        values: this.toCapitalizeObject("air dark earth fire light metal mind water")
                    },
                    traits: {
                        text: "TRAITS",
                        values: this.toCapitalizeObject("Stealth Wither Guard Banner Lifesteal Armor")
                    },
                    triggers: {
                        text: "TRIGGERS",
                        values: this.toCapitalizeObject("Play Summon Inspire Glory Sunset Sunrise Mulligan Draw Dust Death Generic")
                    },
                    manaCost: {
                        text: "MANA COST",
                        values: this.toCapitalizeObject("0 1 2 3 4 5 6 7 8 9 10 11 X")
                    }
                }
            };
        }
        static extractCard(c, id) {
            const triggers = new Set();
            let textDescription = "";
            c.effectTypes.forEach(e => {
                // values of effectTypes: ["Generic", "Death", "Sunset", "Summon", "Glory", "Play", "Inspire", "Sunrise", "Summon& Death"]
                if (e in this.schema.areas.triggers.values) {
                    triggers.add(e);
                }
                else if (e === "Summon& Death") {
                    triggers.add("Summon");
                    triggers.add("Death");
                }
            });
            if ("parsedDescription" in c) {
                // example card without description:
                // https://assets.skyweaver.net/latest/full-cards/4x/13.png
                c.parsedDescription.forEach(element => {
                    /*
                    parsedDescription type: [
                        "normal",     // useless??
                        "buff",       // useless // +-num damage/health/power
                        "bold",
                        "trigger",
                        "mana",       // useless // +-num cost
                        "element",    // useless // the element
                        "card",       // useless // card names
                        "multistat",  // useless // +num/-num
                        "triggerElement",  // element
                        "explainer"   // not what i want
                    ]
                    */
                    let txt = element.value.text;
                    if (!txt) {
                        return;
                    }
                    textDescription += txt;
                    if (element.type === "bold") {
                        txt = this.capitalize(txt);
                        if (txt in this.schema.areas.triggers.values) {
                            triggers.add(txt);
                        }
                    }
                    else if (element.type === "trigger") {
                        if (txt.startsWith(" ")) {
                            txt = txt.slice(1);
                        }
                        if (txt.endsWith(":")) {
                            txt = txt.slice(0, -1);
                        }
                        if (txt.startsWith("Inspire ")) {
                            triggers.add("Inspire");
                        }
                        else if (txt === "Summon & Death") {
                            triggers.add("Summon");
                            triggers.add("Death");
                        }
                        else if (txt in this.schema.areas.triggers.values) {
                            triggers.add(txt);
                        }
                    }
                });
            }
            return {
                id: id, name: c.name, textDescription: textDescription,
                prism: c.prism, cardType: c.type, element: c.element,
                traits: c.traits, triggers: [...triggers], manaCost: c.cost.toString()
            };
        }
        static getAllCardText(card) {
            const allCardText = [
                card.id.toString(),
                card.name.toLowerCase(),
                card.textDescription.toLowerCase(),
                card.cardType.toLowerCase()
            ];
            card.traits.forEach(t => allCardText.push(t.toLowerCase()));
            card.triggers.forEach(t => allCardText.push(t.toLowerCase()));
            return allCardText;
        }
        static update() {
            const searchStr = getE("cardTurnCardsFilterSearch").value.toLowerCase();
            const filters = {};
            document.querySelectorAll("#cardTurnCardsFilter > div > input").forEach(elem => {
                if (elem.checked) {
                    const [k, v] = elem.value.split("_");
                    if (!(k in filters)) {
                        filters[k] = [];
                    }
                    filters[k].push(v);
                }
            });
            log.log("filters:", filters);
            const inCards=[], outCards=[];
            for (const [arr, playerOpponent, area] of [
                [inCards, "Player", "inPlayerZone"],
                [inCards, "Opponent", "inEnemyZone"],
                [outCards, "Player", "outPlayerZone"],
                [outCards, "Opponent", "outEnemyZone"],
            ]) {
                if (!(area in filters)) {
                    continue;
                }
                for (const zone of filters[area]) {
                    const zoneName = `${playerOpponent}_${zone}`;
                    playerOpponentZones[zoneName].items.forEach(item => {
                        if (item.has("cardInstance")) {
                            arr.push(item.get("cardInstance").base);
                        }
                    });
                }
                delete filters[area];
            }
            // filter cards
            const viewCards = [];
            cards.forEach((c, id) => {
                const card = this.extractCard(c, id);
                if (card.cardType === "Enchant" || !(card.prism in this.schema.areas.prism.values)) {
                    // skip enchant cards, skip prism tut tok cards
                    // tut: old or dev cards  tok: cards from other cards
                    return;
                }
                if (searchStr.length > 0) {
                    /* Note: Skyweaver's official library search itself is wierd & not prefect
                    For example 1, card #2010 Hydrate is NOT in result when filter Spell + Water + Draw.
                    Example 2, search "stealth", card #3032 Gus is in result because Songbird has Stealth;
                    but card #1085 Flurry is not in result.
                    */
                    const allCardText = this.getAllCardText(card);
                    if (c.attachedSpellID && cards.has(c.attachedSpellID)) {
                        const attachedSpell = this.extractCard(cards.get(c.attachedSpellID), c.attachedSpellID);
                        this.getAllCardText(attachedSpell).forEach(t => allCardText.push(t));
                    }
                    c.relatedCards.forEach(i => {
                        i = i.toString();
                        this.getAllCardText(this.extractCard(cards.get(i), i)).forEach(t => allCardText.push(t));
                    });
                    if (!allCardText.some(t => t.includes(searchStr))) {
                        return;
                    }
                }
                else if (inCards.length > 0 && !inCards.includes(id)) {
                    return;
                }
                else if (outCards.includes(id)) {
                    return;
                }
                for (const area in filters) {
                    if (area === "traits" || area === "triggers") {
                        if (filters[area].every(v => !card[area].includes(v))) {
                            return;
                        }
                    }
                    else if (!(filters[area].includes(card[area]))) {
                        return;
                    }
                }
                viewCards.push(card);
            });

            // count & sort cards
            const elementCount = {}, typeCount = {};
            viewCards.forEach((c, id) => {
                elementCount[c.element] = (elementCount[c.element] ?? 0) + 1;
                typeCount[c.cardType] = (typeCount[c.cardType] ?? 0) + 1;
            });
            viewCards.sort((a, b) => {
                function getCost(costStr) {
                    return (costStr === "X") ? Infinity : parseInt(costStr);
                }
                for (const k of ["manaCost", "name"]) {
                    let ak = a[k], bk = b[k];
                    if (k === "manaCost") {
                        ak = getCost(ak);
                        bk = getCost(bk);
                    }
                    if (ak < bk) {
                        return -1;
                    }
                    else if (ak > bk) {
                        return 1;
                    }
                }
                return 0;
            });
            log.log("cardFilter:", "update:", "viewCards:", viewCards);
            // show cards
            const elementOrder = [
                "water", "air", "earth", "fire", "dark", "light", "metal", "mind"
            ];
            const typeOrder = ["Spell", "Unit"];
            for (let i=0; i<elementOrder.length; ++i) {
                const k = elementOrder[i];
                getE("cardTurnCardsStat").children[8+1+2+i].innerText = elementCount[k] ?? 0;
            }
            for (let i=0; i<typeOrder.length; ++i) {
                const k = typeOrder[i];
                getE("cardTurnCardsStat").children[8+1+2+8+1+i].innerText = typeCount[k] ?? 0;
            }
            getE("cardTurnCardsList").innerHTML = "";
            for (const c of viewCards) {
                const cardDiv = document.createElement("div");
                const prependName = (c.name.toLowerCase()===searchStr) ? `#${c.id} ` : "";
                cardDiv.innerHTML = `
                    <div>${c.manaCost}</div>
                    <div class="cardTurnImgContainer">
                        <img src="${icons.type[c.cardType.toLowerCase()]}">
                    </div>
                    <div>${prependName}${c.name}</div>
                    <div class="cardTurnImgContainer">
                        <img src="${icons.element[c.element]}">
                    </div>`;
                cardDiv.children[2].style.background = 'linear-gradient(to right, ' +
                    'rgba(0, 0, 0, 0.75) 20%, rgba(255, 255, 255, 0.5)), ' +
                    `url("https://assets.skyweaver.net/latest/full-cards/4x/${c.id}.png")` +
                    "60% 20% / 120% auto";
                cardDiv.addEventListener("mouseenter", e => { showCard(e, c.id) });
                getE("cardTurnCardsList").appendChild(cardDiv);
            }
        }
        static clear() {
            getE("cardTurnCardsFilterSearch").value = "";
            document.querySelectorAll("#cardTurnCardsFilter > div > input").forEach(elem => {
                elem.checked = false;
            });
            this.update();
        }
    }
    function showCard(e, cid) {
        // log.debug("showCard", e, cid);
        const rootDiv = getE("cardTurnRootDiv");
        const hoverImg = getE("cardTurnHoverImg");
        const hoverImgSize = [346/2, 532/2];
        e.target.addEventListener("mouseleave", e => {
            hoverImg.style.display = "none";
        });
        let x, y;
        y = e.clientY - hoverImgSize[1]/2;
        if (rootDiv.offsetLeft + rootDiv.offsetWidth/2 < window.innerWidth/2) {
            // rootDiv @ left half
            x = rootDiv.offsetLeft + rootDiv.offsetWidth;
        }
        else {
            // rootDiv @ right half
            x = rootDiv.offsetLeft - hoverImgSize[0];
        }
        x = Math.max(0, x);
        x = Math.min(window.innerWidth-hoverImgSize[0], x);
        y = Math.max(0, y);
        y = Math.min(window.innerHeight-hoverImgSize[1], y);
        hoverImg.setAttribute("src", `https://assets.skyweaver.net/latest/full-cards/4x/${cid}.png`);
        hoverImg.style.left = x + "px";
        hoverImg.style.top = y + "px";
        hoverImg.style.display = "unset";
    }
    function toggleViewCards(enemyPlayer) {
        log.log("toggleViewCards:", enemyPlayer);
        if (viewingCards !== enemyPlayer) {
            // detemine which prisms to include, which cards to exclude
            const target = (enemyPlayer === "Enemy") ? (1-v.player) : v.player;
            const prisms = v.state.state.players[target].prisms;
            log.log("prisms:", prisms);
            cardFilter.clear();
            for (const z in cardFilter.zones) {
                getE(`cardTurnFilterCheckbox_out${enemyPlayer}Zone_${z}`).checked = true;
            }
            for (const p of prisms) {
                getE(`cardTurnFilterCheckbox_prism_${p}`).checked = true;
            }
            cardFilter.update();
            
            // getE("cardTurnCardsText").innerText = (
            //     (enemyPlayer === "Enemy") ? "Enemy's" : "Your") + " other " +
            //     prisms.map(p => cardFilter.schema.areas.prism.values[p]).join(" & ") + " cards:";
            getE("cardTurnCardsText").innerText = (
                (enemyPlayer === "Enemy") ? "Enemy's" : "Your") + " other prism cards:";
            getE("cardTurnEnemyBtn").innerText = "+";
            getE("cardTurnPlayerBtn").innerText = "+";
            getE(`cardTurn${enemyPlayer}Btn`).innerText = "x";
            getE("cardTurnRootDiv").style.removeProperty("top");
            getE("cardTurnRootDiv").classList.remove("cardTurnCardsClosed");
            getE("cardTurnCardsFilter").classList.add("cardTurnCardsFilterClosed");
            viewingCards = enemyPlayer;
        }
        else {
            getE("cardTurnRootDiv").classList.add("cardTurnCardsClosed");
            getE("cardTurnEnemyBtn").innerText = "+";
            getE("cardTurnPlayerBtn").innerText = "+";
            viewingCards = null;
        }
    }

    const actParser = new myActionParser(actionHandler);
    function workerProxyStoreSubscriber(ev) {
        function saveLocalStorage() {
            localStorage.setItem(localStorageKey, JSON.stringify({
                turn, hand, rootDivPos
            }));
        }
        function draggable(elem) {
            // log.log("draggable");
            elem.onmousedown = function(e) {
                // log.log("mouse down");
                e = e || window.event;
                e.preventDefault();
                const [dx, dy] = [elem.offsetLeft-e.clientX, elem.offsetTop-e.clientY];
                // log.log("coord:", x, y, elem.offsetLeft, elem.offsetTop);
                document.onmousemove = function(e) {
                    e = e || window.event;
                    e.preventDefault();
                    document.body.style.cursor = "grab";
                    // const [dx, dy] = [e.clientX - x, e.clientY - y];
                    // [x, y] = [e.clientX, e.clientY];

                    // log.log("mouse move", x, y, dx, dy);
                    // log.log("coord:", x, y, elem.offsetLeft, elem.offsetTop);
                    const safe = 10;
                    let [newx, newy] = [e.clientX + dx, e.clientY + dy];
                    newx = Math.max(-elem.offsetWidth+safe, newx);
                    newx = Math.min(window.innerWidth-safe, newx);
                    newy = Math.max(-elem.offsetHeight+safe, newy);
                    newy = Math.min(window.innerHeight-safe, newy);
                    elem.style.left = newx + "px";
                    if (!viewingCards) {
                        elem.style.top = newy + "px";
                    }
                };
                document.onmouseup = function() {
                    // log.log("mouse up");
                    document.onmousemove = null;
                    document.onmouseup = null;
                    // document.body.style.removeProperty("cursor");
                    document.body.style.cursor = "default";
                    rootDivPos[0] = elem.style.left;
                    if (!viewingCards) {
                        rootDivPos[1] = elem.style.top;
                    }
                    saveLocalStorage();
                };
            };
        }
        if (!noerror) {
            return;
        }
        try {
            if (enemy === null) {
                enemy = 1-v.player;
                log.log("enemy:", enemy);
            }
            // JSON.stringify(window.skyweaverWorkerProxyStoreEvents) then copy object to debug
            // log.debug("event:", ev);
            window.skyweaverWorkerProxyStoreEvents.push([turn, null, null, ev]);
            const eventHandleResult = actParser.handleEvent(ev);
            window.skyweaverWorkerProxyStoreEvents[window.skyweaverWorkerProxyStoreEvents.length-1][1] = deepCopy(hand);
            window.skyweaverWorkerProxyStoreEvents[window.skyweaverWorkerProxyStoreEvents.length-1][2] = eventHandleResult;
            saveLocalStorage();

            if (rootDiv === null) {
                const rootDivHTML = `
<div id="cardTurnRootDiv" class="cardTurnCardsClosed">
    <p id="cardTurnTurnText">
        <!-- <span>11</span> -->
    </p>
    <div id="cardTurnEnemyBtn" title="View enemy's not in graveyard prism cards">+</div>
    <div id="cardTurnPlayerBtn" title="View your not in deck prism cards">+</div>
    <div id="cardTurnCardsRoot">
        <div id="cardTurnCardsText">
            <!-- Cards ∉ your deck: -->
        </div>
        <div id="cardTurnCardsFilter" class="cardTurnCardsFilterClosed">
            <input id="cardTurnCardsFilterSearch" placeholder="Search" autofocus>
            <button id="cardTurnCardsFilterClear">X</button>
            <!-- the 2 columns filter box -->
            <div>
                <!-- Content set in Javascript
                <p>+ Player</p>
                <input type="checkbox" id="cbox_prism_str" value="prism_str" data-com.bitwarden.browser.user-edited="yes">
                <label for="cbox_prism_str">Strength</label>
                <br>
                <input type="checkbox" id="cbox_prism_wis" value="prism_wis" data-com.bitwarden.browser.user-edited="yes">
                <label for="cbox_prism_wis">Wisdom</label>
                -->
            </div>
            <div></div>
        </div>
        <div id="cardTurnCardsStat">
            <div class="cardTurnImgContainer"><img src="${icons.element.water}"></div>
            <div class="cardTurnImgContainer"><img src="${icons.element.air}"></div>
            <div class="cardTurnImgContainer"><img src="${icons.element.earth}"></div>
            <div class="cardTurnImgContainer"><img src="${icons.element.fire}"></div>
            <div class="cardTurnImgContainer"><img src="${icons.element.dark}"></div>
            <div class="cardTurnImgContainer"><img src="${icons.element.light}"></div>
            <div class="cardTurnImgContainer"><img src="${icons.element.metal}"></div>
            <div class="cardTurnImgContainer"><img src="${icons.element.mind}"></div>
            <div></div>
            <div class="cardTurnImgContainer"><img src="${icons.type.spell}"></div>
            <div class="cardTurnImgContainer"><img src="${icons.type.unit}"></div>
            <div></div><div></div><div></div><div></div>
            <div></div><div></div><div></div><div></div>
            <div></div>
            <div></div><div></div>
        </div>
        <div id="cardTurnCardsList">
            <!-- <div>
                <div>1</div>
                <div class="cardTurnImgContainer"><img src="type_unit.png"></div>
                <div>Call to Action</div>
                <div class="cardTurnImgContainer">
                    <img src="element_water.png">
                </div>
            </div> -->
        </div>
    </div>
    <img id="cardTurnHoverImg">
    <div id="cardTurnHoverHand">
        <p><!-- #23   Enemy Deck 23  >  Enemy Hand 0 Enemy  PlayCard   Fatigue: ? ... --></p>
        <div id="cardTurnHoverHandCards">
            <!-- <div>
                <p>Attacker (died)</p>
                <div class="cardTurnImgContainer">
                    <img src="https://assets.skyweaver.net/latest/full-cards/4x/2052.png">
                </div>
            </div> -->
        </div>
    </div>
</div>
                `;
                const rootDivCSS = `
#cardTurnRootDiv {
    box-sizing: content-box;
    position: fixed;
    left: 180px;
    width: 234px;

    /* toggle these two when open/close */
    /* top: 10%; */
    top: 0;

    /* toggle these two when open/close */
    /* height: 50px; */
    bottom: 0;

    /* border: 2px solid red; */ /* testing */
    color: white;
}
#cardTurnTurnText, #cardTurnEnemyBtn, #cardTurnPlayerBtn, #cardTurnCardsRoot {
    background-color: rgba(0, 0, 0, 0.75);
}
#cardTurnTurnText {
    width: 204px;
    height: 50px;
    margin: 0;
    line-height: 50px;
    text-align: center;
    border: 2px solid rgba(146, 104, 230, 0.8);

    /* toggle when open/close */
    /* border-bottom-left-radius: 12px; */

    border-right-width: 1px;
}
#cardTurnTurnText > span {
    display: inline-block;
    height: 100%;
    width: 20px;
}
#cardTurnTurnText > span:hover {
    font-weight: bold;
}

#cardTurnEnemyBtn, #cardTurnPlayerBtn {
    border: 2px solid rgba(146, 104, 230, 0.8);
    width: 30px;
    height: 25px;
    position: absolute;
    right: 0;
    line-height: 25px;
    text-align: center;
    border-left-width: 1px;
    cursor: pointer;
}
#cardTurnEnemyBtn:hover, #cardTurnPlayerBtn:hover {
    filter: brightness(130%);
    font-weight: bold;
}
#cardTurnEnemyBtn {
    top: 0;
    border-top-right-radius: 12px;
    border-bottom-width: 1px;
}
#cardTurnPlayerBtn {
    top: 25px;
    border-top-width: 1px;
}

#cardTurnCardsRoot {
    border: 2px solid rgba(146, 104, 230, 0.8);
    border-top-width: 0;
    height: calc(99% - 50px);
    border-bottom-left-radius: 12px;
}
#cardTurnCardsText {
    padding: 10px 8px;
    cursor: pointer;
}
#cardTurnCardsFilter {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    height: calc(100% - 105px);
    margin: 2px;
    margin-bottom: 10px;
    padding: 5px;
    border: 1px solid rgba(146, 104, 230, 0.8);
    overflow-y: scroll;
    scrollbar-width: none;
}
#cardTurnCardsFilterSearch {
    grid-column: 1 / -2;
}
#cardTurnCardsFilter > div {
    grid-column-end: span 4;
}
#cardTurnCardsFilter > div > p {
    margin: 5px;
    color: rgb(142, 115, 216);
    font-weight: bold;
}
#cardTurnCardsFilter > div > label {
    width: 80px;
    display: inline-block;
}
#cardTurnCardsFilter.cardTurnCardsFilterClosed {
    display: none;
}
#cardTurnCardsStat {
    display: grid;
    grid-template-columns: 3fr 3fr 3fr 3fr 3fr 3fr 3fr 3fr 1fr 3fr 3fr;
    height: 50px;
    border: 1px solid rgba(146, 104, 230, 0.8);
    text-align: center;
    margin: 2px;
    margin-bottom: 10px;
    padding: 5px;
}
#cardTurnCardsList {
    height: calc(100% - 105px);
    overflow-y: scroll;
    scrollbar-width: none;
    /* background-color: rgba(0, 0, 0, 0.5); */
}
#cardTurnCardsList > div {
    display: grid;
    grid-template-columns: 1fr 1fr 7fr 1fr;
    height: 40px;
    line-height: 40px;
    border: 1px solid rgba(146, 104, 230, 0.8);
    margin: 2px;
    padding: 0 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
#cardTurnCardsList > div > div {
    height: 40px;
}
#cardTurnCardsList > div > div:nth-child(1) {
    text-align: center;
}
#cardTurnCardsList > div > div:nth-child(3) {
    margin: 3px;
    /* background: linear-gradient(to right, rgba(0, 0, 0, 0.75) 20%, rgba(255, 255, 255, 0.5)), url("https://assets.skyweaver.net/latest/full-cards/4x/33.png") 60% 20% / 120% auto; */
}
#cardTurnHoverImg {
    position: fixed;
    width: 173px;
    height: 266px;
    display: none;
}

#cardTurnHoverHand {
    box-sizing: content-box;
    position: fixed;
    width: 519px;
    height: 381px;
    border: 2px solid rgba(146, 104, 230, 0.8);
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    /* top: 20%;
    left: 180px; */
    display: none;
}
#cardTurnHoverHand > p {
    height: 40px;
    margin: 12px;
    white-space: pre;
}
#cardTurnHoverHandCards {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
}
#cardTurnHoverHandCards > div > p {
    height: 20px;
    margin: 12px 0;
    text-align: center;
}
#cardTurnHoverHandCards > div > div {
    width: 173px;
    height: 266px;
}
#cardTurnHoverHand.cardTurnHandClosed {
    height: 64px;
}
#cardTurnHoverHand.cardTurnHandClosed > #cardTurnHoverHandCards {
    display: none;
}

.cardTurnImgContainer {
    display: flex;
    align-items: center;
    justify-content: center;
}
.cardTurnImgContainer > img {
    max-width: 100%;
    max-height: 100%;
}

#cardTurnRootDiv.cardTurnCardsClosed {
    top: 10%; /* probably should be taken care of in js*/

    height: 50px;
    bottom: unset;
}
#cardTurnRootDiv.cardTurnCardsClosed > #cardTurnCardsRoot{
    display: none;
}
#cardTurnRootDiv.cardTurnCardsClosed > #cardTurnTurnText {
    border-bottom-left-radius: 12px;
}
                `;

                log.log("create root div");
                const temp = document.createElement("template");
                temp.innerHTML = rootDivHTML.trim();
                rootDiv = temp.content.firstChild;
                for (let node of temp.content.childNodes) {
                    document.getElementsByTagName("body")[0].appendChild(node);
                }
                log.log("rootDiv", rootDiv);

                const newStyle = document.createElement("style");
                newStyle.innerHTML = rootDivCSS;
                document.getElementsByTagName("head")[0].appendChild(newStyle);

                getE("cardTurnEnemyBtn").onclick = function() {
                    // log.log("cardTurnEnemyBtn");
                    toggleViewCards("Enemy");
                };
                getE("cardTurnPlayerBtn").onclick = function() {
                    // log.log("cardTurnPlayerBtn");
                    toggleViewCards("Player");
                };

                draggable(getE("cardTurnRootDiv"));

                for (const h of hand) {
                    addHand(h);
                }

                // add p, input checkbox, label into #cardTurnCardsFilter
                const filterSchema = cardFilter.schema;
                for (let i=0; i<filterSchema.columns.length; ++i) {
                    let columnDivInnerHTML = "";
                    for (const area of filterSchema.columns[i]) {
                        const areaText = filterSchema.areas[area].text;
                        columnDivInnerHTML += `<p>${areaText}</p>`;
                        const areaValues = filterSchema.areas[area].values;
                        for (const value in areaValues) {
                            const valueText = areaValues[value];
                            columnDivInnerHTML += `
                                <input type="checkbox" id="cardTurnFilterCheckbox_${area}_${value}" value="${area}_${value}">
                                <label for="cardTurnFilterCheckbox_${area}_${value}">${valueText}</label><br>
                            `;
                        }
                    }
                    document.querySelectorAll("#cardTurnCardsFilter > div")[i].innerHTML = columnDivInnerHTML;
                }
                getE("cardTurnCardsText").onclick = function() {
                    const filterDom = getE("cardTurnCardsFilter");
                    const txt = getE("cardTurnCardsText");
                    if (filterDom.classList.contains("cardTurnCardsFilterClosed")) {
                        filterDom.classList.remove("cardTurnCardsFilterClosed");
                        txt.innerText = "Filter cards:";
                        getE("cardTurnCardsFilterSearch").focus();
                    }
                    else {
                        filterDom.classList.add("cardTurnCardsFilterClosed");
                        txt.innerText = "Filtered cards:";
                    }
                };
                getE("cardTurnCardsFilterSearch").addEventListener("input", e => {
                    cardFilter.update();
                });
                getE("cardTurnCardsFilterSearch").addEventListener("keydown", e => {
                    // skyweaver webpage shortcut: a history d deck g graveyard
                    e.stopPropagation();
                });
                getE("cardTurnCardsFilterClear").onclick = function() {
                    // keep search box text, but clear everything else
                    const s = getE("cardTurnCardsFilterSearch").value;
                    cardFilter.clear();
                    getE("cardTurnCardsFilterSearch").value = s;
                    cardFilter.update();
                };
                document.querySelectorAll("#cardTurnCardsFilter > div > input").forEach(elem => {
                    elem.addEventListener("change", e => {
                        cardFilter.update();
                    });
                });
            }
        }
        catch (error) {
            log.error("workerProxyStoreSubscriber error:", error);
            log.trace("workerProxyStoreSubscriber error trace:",);
            log.alert("error occurred in workerProxyStoreSubscriber!", error, error.stack);
            noerror = false;
        }
    }
    return workerProxyStoreSubscriber;
}
function patchScript(originalJS) {
    const insertPoint = originalJS.indexOf("function cardEntityOwner(e){return");
    if (insertPoint === -1) {
        log.alert("Skyweaver code changed!", "insert point not found.")
        return;
    }
    const insertCode = `
        console.log("subscribeToCardEvents", "start");
        try {
            const workerProxyStoreSubscriber = (${cardTurnSubscriber})();
            v.subscribeToCardEvents(workerProxyStoreSubscriber);
        }
        catch (error) {
            console.error("Skyweaver card turn:", "subscribeToCardEvents error:", error);
            console.trace("Skyweaver card turn:", "subscribeToCardEvents error trace:");
            alert(
                "Skyweaver card turn extension: error occurred when subscribing event!\\n" +
                "Disable extension and notify developer if this happened multiple times.\\n" +
                "Error detail: " + error + "\\n" +
                "Error stack trace:" + error.stack
            );
        }
        console.log("Skyweaver card turn:", "subscribeToCardEvents", "finish");
    `;
    return originalJS.slice(0, insertPoint) + insertCode + originalJS.slice(insertPoint);
}

function addScript(text) {
    const newScript = document.createElement('script');
    newScript.textContent = text;
    document.getElementsByTagName("body")[0].appendChild(newScript);
}

// if there's registered service worker, unregister & refresh
//   because Chrome service worker would cache script
const registrations = await navigator.serviceWorker.getRegistrations();
if (registrations.length > 0) {
    for(let registration of registrations) {
        log.log("remove service worker:", registration);
        registration.unregister();
    }
    location.reload(true);
    return;
}

window.addEventListener("load", function() {
    for (const elem of document.getElementsByTagName("script")) {
        const src = elem.getAttribute("src");
        // https:\/\/play\.skyweaver\.net
        const toMatch = /^\/game\/([a-f0-9]){40}\/main-([a-f0-9]){20}.js$/g;
        log.log("found script:", src);
        if (src && src.match(toMatch)) {
            log.log("fetch script:", src);
            fetch("https://play.skyweaver.net"+src).then(response => {
                log.log("got response.");
                return response.text();
            }).then(text => {
                log.log("patching script...");
                text = patchScript(text);
                addScript(text);
                log.log("patched script.");
            }).catch(function(error) {
                log.error("patch script error:", error);
                log.trace("patch script error trace:");
                log.alert("patch script error!", error, error.stack);
            });
        }
    }
});

window.addEventListener('beforescriptexecute', function(e) {
    // only firefox would trigger beforescriptexecute
    const src = e.target.src;
    log.log("detect script:", src);
    if (src.match(/^https:\/\/play\.skyweaver\.net\/game\/([a-f0-9]){40}\/main-([a-f0-9]){20}.js$/g)) {
        log.log("block script:", src);
        e.preventDefault();
        e.stopPropagation();
    }
});

log.log("global finish");

}
catch (error) {
    log.error("global error:", error);
    log.trace("global error trace:");
    log.alert("content script global code error!", error, error.stack);
}

})();
