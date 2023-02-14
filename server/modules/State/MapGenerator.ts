import { IHex, IRoad, ISettlement } from "./types";
import newbieMap from "./newbieMap"

export default class MapGenerator {
  constructor(
    private tokens: Array<number> = [3, 4, 5, 6, 8, 9, 10, 11],
    private hexes: Array<string> = ["hills", "forest", "mountains", "fields", "pasture"],
    private harbors: Array<string> = ["all", "all", "all", "all", "brick", "grain", "lumber", "ore", "wool"],
    private HEX_COUNT = 37,
    ) {}

    public getNewbieMap() {
      // this.checkMapObject(newbieMap);
      return newbieMap;
    }

    public getRandomMap() {
      let newMap = newbieMap;

      let tokens = this.shuffle([...this.tokens, ...this.tokens, 2, 12]);
      let types = this.shuffle([...this.hexes, ...this.hexes, ...this.hexes, "forest", "fields", "pasture"]);

      const desertIndex = this.randomNumber(0, 18);
      tokens.splice(desertIndex, 0, 0);
      types.splice(desertIndex, 0, "desert");

      let harbors = this.shuffle([...this.harbors]);

      let t = 0;
      let h = 0;
      for (let i = 0; i < this.HEX_COUNT; i++) {
        if (newMap[i].type === "harbor") {
          newMap[i].harbor = harbors[h];
          h++;
        } else if(newMap[i].type !== "sea") {
          newMap[i].token = tokens[t];
          newMap[i].type = types[t];
          t++;
        }
      }

      return newMap;
    }

    private checkMapObject(map: any) {

      function isSettlement(set: ISettlement | false): set is ISettlement {
        const node = set as ISettlement;
        return node.player === false && Boolean(node.id) && node.city === false && Boolean(node.nextHexes instanceof Array) && Boolean(node.nextNodes instanceof Array);
      }

      function isRoad(set: IRoad | false): set is IRoad {
        const node = set as IRoad;
        return node.player === false && Boolean(node.id) && Boolean(node.nextNodes instanceof Array);
      }

      map.forEach((hex: any) => {
        const expect = ["type", "token", "settlement_N", "road_N", "road_W", "road_S", "settlement_S", "robber", "harbor"].sort().join('');
        const have = Object.getOwnPropertyNames(hex).sort().join('');

        if (expect == have) {
          const settlement = ["id", "player", "city", "nextHexes", "nextNodes"].sort().join('');
          if (hex.settlement_N !== false) {
            const settlementN = Object.keys(hex.settlement_N).sort().join('');
            console.log(isSettlement(hex.settlement_N));
            if (settlement != settlementN) {
              console.log("Error in settlement_N", hex);
              console.log(expect);
              console.log(have);
            }
          }
          if (hex.settlement_S !== false) {
            const settlementS = Object.keys(hex.settlement_S).sort().join('');
            console.log(isSettlement(hex.settlement_S));
            if (settlement != settlementS) {
              console.log("Error in settlement_S", hex);
              console.log(expect);
              console.log(have);
            }
          }

          const road = ["id", "player", "nextNodes"].sort().join('');
          if (hex.road_N !== false) {
            const roadN = Object.keys(hex.road_N).sort().join('');
            console.log(isRoad(hex.road_N));
            if (road != roadN) {
              console.log("Error in road_N", hex);
              console.log(road);
              console.log(roadN);
            }
          }
          if (hex.road_W !== false) {
            const roadW = Object.keys(hex.road_W).sort().join('');
            console.log(isRoad(hex.road_W));
            if (road != roadW) {
              console.log("Error in road_W", hex);
              console.log(road);
              console.log(roadW);
            }
          }
          if (hex.road_S !== false) {
            const roadS = Object.keys(hex.road_S).sort().join('');
            console.log(isRoad(hex.road_S));
            if (road != roadS) {
              console.log("Error in road_S", hex);
              console.log(road);
              console.log(roadS);
            }
          }
        } else {
          console.log("Error in hex", hex);
          console.log(expect);
          console.log(have);
        }
      })
    }

    public randomNumber(min: number, max: number) {
      let number = min + Math.random() * (max + 1 - min);
      return Math.floor(number);
    }

    public shuffle(array: Array<any>) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
}
