export const getEmptyPlayer = () => {
  return {
    name: '',
    color: '',
    longestRoad: false,
    largestArmy: false,

    hand: {
      resources: {
        brick: 10,
        grain: 10,
        lumber: 10,
        ore: 10,
        wool: 10,
      },
      development: {
        victory: 1,
        knights: 10,
        road: 10,
        plenty: 10,
        monopoly: 10,
      },
    },
    harbors: [],
    hexes: [],
    avalible: [],

    settlements: [],
    cities: [],
    roads: [],
    settlementsStock: 5,
    citiesStock: 4,
    roadsStock: 15,

    roadChain: 0,
    armySize: 0,
  }
};
