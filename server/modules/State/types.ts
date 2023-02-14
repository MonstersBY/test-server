// Map
interface IHex {
  type: string,
  token: number,
  settlement_N: ISettlement | false,
  road_N: IRoad | false,
  road_W: IRoad | false,
  road_S: IRoad | false,
  settlement_S: ISettlement | false,
  robber: boolean,
  harbor: string | false,
}

interface ISettlement {
  id: string,
  player: string | false,
  city: boolean,
  nextHexes: Array<number>,
  nextNodes: Array<string>,
}

interface IRoad {
  id: string,
  player: string | false,
  nextNodes: Array<string>,
}

// Player
interface IPlayerInfo {
  id: number,
  color: string,
  longestRoad: boolean,
  largestArmy: boolean,

  hand: IPlayerHand,
  harbors: Array<string>,
  hexes: Array<number>,
  avalible: Array<string>,

  settlements: Array<string>,
  cities: Array<string>,
  roads:  Array<string>,

  roadChain: number,
  armySize: number,
}

interface IPlayerHand {
  resources: IResources,
  development: IDevCards,
}

interface IResources {
  brick: number,
  grain: number,
  lumber: number,
  ore: number,
  wool: number,
}

interface IDevCards {
  victory: number,
  knights: number,
  road: number,
  plenty: number,
  monopoly: number,
}

function getElementBySelector<T extends HTMLElement>(
  selector: string,
  parent: HTMLElement | HTMLInputElement | DocumentFragment | Document = document
): T {
  const element: T | null = parent.querySelector(selector);
  if (element === null)
    throw new Error(`Could not find element with ${selector} selector`);
  return element;
}

export { IHex, ISettlement, IRoad, IPlayerInfo, getElementBySelector, IPlayerHand}
