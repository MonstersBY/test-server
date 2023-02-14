// import { IPlayerInfo } from "./types";

export const getEmptyPlayer = (i) => {
  return {
    id: i,
    color: '',
    longestRoad: false,
    largestArmy: false,

    hand: {
      resources: {
        brick: 0,
        grain: 0,
        lumber: 0,
        ore: 0,
        wool: 0, 
      },
      development: {
        victory: 0,
        knights: 0,
        road: 0,
        plenty: 0,
        monopoly: 0,
      },
    },
    harbors: [],
    hexes: [],
    avalible: [],

    settlements: [],
    cities: [],
    roads: [],

    roadChain: 0,
    armySize: 0,
  }

};
