import MapGenerator from "./MapGenerator.js"
import roadCounter from "./RoadCounter.js";

export default class State {
  constructor() {
    this.playersCount = 4;
    this.gameMode = "classic";
    this.gameMap = "newbie";
    this.turn = -1;
    this.foundingStage = true;
    this.activePlayer = 0;
    this.diceRoll = [1, 1];
    this.playersInfo = [];
    this.mapObject = [];
    this.developmentDeck = [];
    this.largestArmy = 0;
    this.longestRoad = 0;
    this.HEX_COUNT = 37;
  }

  initialState() {
    const generator = new MapGenerator(); //
    this.mapObject = JSON.parse(JSON.stringify(generator.generateMap(this.gameMap))); //разрываем связь
    this.playersInfo = JSON.parse(JSON.stringify(generator.generatePlayers(this.playersCount)));
    this.developmentDeck = JSON.parse(JSON.stringify(generator.generateDevelopmentDeck()));
    this.activePlayer = 0;
    this.foundingStage = true;
  }

  addResoursesThisTurn(dice, map, players) {
    if (map  && players) {
      let currentHexes = []
      for (let i = 0; i < this.HEX_COUNT; i++) {
        if (map[i].token === dice && !map[i].robber) {
          currentHexes.push(i);
        }
      }

      for (const player of players) {
        for (let i = 0; i < player.hexes.length; i++) {
          for (let j = 0; j < currentHexes.length; j++) {
            if (player.hexes[i] === currentHexes[j]) {
              switch (map[currentHexes[j]].type) {
                case "hills":
                  player.hand.resources.brick += 1;
                  break;
                case "fields":
                  player.hand.resources.grain += 1;
                  break;
                case "forest":
                  player.hand.resources.lumber += 1;
                  break;
                case "mountains":
                  player.hand.resources.ore += 1;
                  break;
                case "pasture":
                  player.hand.resources.wool += 1;
                  break;
              }
            }
          }
        }
      }
    }
  }

  addResoursesFirstSettlement(map, player) {
    let hex

    const arrMap = [this.mapObject[Number(player.settlements[1].split("_")[0])].settlement_N, this.mapObject[Number(player.settlements[1].split("_")[0])].settlement_S]
    for (let i = 0; i < arrMap.length; i++) {
      if (arrMap[i]){
        if (arrMap[i].id == player.settlements[1]) {
          hex = arrMap[i].nextHexes
          break
        }
      }    
    }
    
    for (let i = 0; i < hex.length; i++) {
      switch (map[hex[i]].type) {
        case "hills":
          player.hand.resources.brick += 1;
        break;
        case "fields":
          player.hand.resources.grain += 1;
        break;
        case "forest":
          player.hand.resources.lumber += 1;
        break;
        case "mountains":
          player.hand.resources.ore += 1;
        break;
        case "pasture":
          player.hand.resources.wool += 1;
        break;
      }
    }
  }

  isWinner(player) {
    let points = 0;
    points = player.longestRoad ? points + 2 : points;
    points = player.largestArmy ? points + 2 : points;
    points += player.settlements.length;
    points += player.cities.length * 2;
    points += player.hand.development.victory;
    return points >= 10;
  }

  isDiscount(player, type) {
    return player.harbors.some(harbor => harbor === type);
  }

  // Player actions
  setRobber(player, id) {
    const i = id.split("_")[1];
    if (this.mapObject) {
      this.mapObject.forEach((hex) => {
        hex.robber = false;
      })
      this.mapObject[i].robber = true;
    }
    let roads = [...this.mapObject[i].settlement_N.nextNodes, ...this.mapObject[i].settlement_S.nextNodes];
    roads = roads.filter(e => e.split("_")[2] !== "W");
    let settlementsToRob = [];
    roads.forEach(road => {
      const hex = road.split("_")[0];
      const hode = "road_" + road.split("_")[2];
      settlementsToRob.push(...this.mapObject[hex][hode].nextNodes);
    })
    settlementsToRob = [...new Set(settlementsToRob)];
    return settlementsToRob;
  }

  exchangeResourseBank(player, lose, get) {
    let number = 4;
    if (this.isDiscount(player, "all")) {
      number = 3;
    }
    if (this.isDiscount(player, lose)) {
      number = 2;
    }
    player.hand.resources[lose] -= number;
    player.hand.resources[get] += 1;
  }

  makeExchangeProposal(player) { }// !!!

  // Building
  setNewSettlement(player, id) {
    // add to mapObject
    const hex = id.split("_")[0];
    const hode = "settlement_" + id.split("_")[2];
    this.mapObject[hex][hode].player = String(player.color);

    //block near settlments
    const nearNodes = this.mapObject[hex][hode].nextNodes;

    let nearSettlments = [];
    for (let i = 0; i < nearNodes.length; i++) {
      const hex = nearNodes[i].split("_")[0];
      const roadId = "road_" + nearNodes[i].split("_")[2];
      nearSettlments.push(...this.mapObject[hex][roadId].nextNodes);
    }
    const nearSettlmentsSet = new Set(nearSettlments);
    nearSettlmentsSet.delete(id);
    nearSettlments = [...nearSettlmentsSet]
    for (let j = 0; j < nearSettlments.length; j++) {
      const hex = nearSettlments[j].split("_")[0];
      const settlmentId = "settlement_" + nearSettlments[j].split("_")[2];
      if (!this.mapObject[hex][settlmentId].player) {
        this.mapObject[hex][settlmentId].player = "nobody";
      }
    }

    // add to playerInfo
    player.settlements.push(id);
    if (this.mapObject[hex][hode].harbor) {
      player.harbors.push(this.mapObject[hex][hode].harbor);
    }
    const nextHexes = this.mapObject[hex][hode].nextHexes;
    player.hexes.push(...nextHexes);
    player.avalible.push(...nearNodes);
  }

  setNewCity(player, id) {
    // add to mapObject
    const hex = id.split("_")[0];
    const hode = "settlement_" + id.split("_")[2];
    this.mapObject[hex][hode].city = true;

    // add to playerInfo
    player.settlements.splice(player.settlements.indexOf(id), 1);
    player.cities.push(id);
    const nextHexes = this.mapObject[hex][hode].nextHexes;
    player.hexes.push(...nextHexes);
  }

  setNewRoad(player, id) {
    // add to mapObject
    const hex = id.split("_")[0];
    const hode = "road_" + id.split("_")[2];
    this.mapObject[hex][hode].player = player.color;

    const nearNodes = this.mapObject[hex][hode].nextNodes;

    let nearRoads = [];
    for (let i = 0; i < nearNodes.length; i++) {
      const hex = nearNodes[i].split("_")[0];
      const settlementId = "settlement_" + nearNodes[i].split("_")[2];
      nearRoads.push(...this.mapObject[hex][settlementId].nextNodes);
    }
    const nearRoadsSet = new Set(nearRoads);
    nearRoadsSet.delete(id);
    nearRoads = [...nearRoadsSet];

    // add to playerInfo
    player.roads.push(id);
    player.avalible.push(...nearRoads, ...nearNodes);
  }

  // Development
  buyDevelopmentCard(player) {
    const resources = player.hand.resources;
    const development = player.hand.development;
    if (resources.grain > 0 &&
      resources.ore > 0 &&
      resources.wool > 0) {
      resources.grain -= 1;
      resources.ore -= 1;
      resources.wool -= 1;
      const topCard = this.developmentDeck.pop();
      switch (topCard) {
        case "road":
          development.road += 1;
          break;
        case "plenty":
          development.plenty += 1;
          break;
        case "monopoly":
          development.monopoly += 1;
          break;
        case "knights":
          development.knights += 1;
          break;
        case "victory":
          development.victory += 1;
          break;
      }
    }
  }

  // Tecnical checks and events
  #isAnyResourse(res) {
    return res.brick + res.grain + res.lumber + res.ore + res.wool;
  }

  #chooseRandomResourse(res) {
    const randomNumber = new MapGenerator().randomNumber;
    const resources = ["grain", "wool", "ore", "lumber", "brick"];
    let chosen = 0;
    let i;
    do {
      i = Math.floor(Math.random() * 5);
      chosen = res[resources[i]];
    }
    while (!chosen)
    return resources[i];
  }

  countCardRobber(players) {
    for (let i = 0; i < players.length; i++) {
      let sum = 0;
      for (let cards of Object.values(players[i].hand.resources)) {
        sum += cards;
      }
      if (sum > 7) {
        this.deleteCard(players[i], Math.ceil(sum/2))
      }
    }
  }

  deleteCard(player, sum) {
    const resources = ["grain", "wool", "ore", "lumber", "brick"];
    for (let i = 0; i < sum;) {
      const j = Math.floor(Math.random() * 5)
      switch (resources[j]) {
        case 'grain':
          if(player.hand.resources.grain) {
            player.hand.resources.grain--
            i++
          }
          break;
        case 'wool':
          if(player.hand.resources.wool) {
            player.hand.resources.wool--
            i++
          }
          break;
        case 'ore':
          if(player.hand.resources.ore) {
            player.hand.resources.ore--
            i++
          }
          break;
        case 'lumber':
          if(player.hand.resources.lumber) {
            player.hand.resources.lumber--
            i++
          }
          break;
        case 'brick':
          if(player.hand.resources.brick) {
            player.hand.resources.brick--
            i++
          }
          break;
      }
    }
  }

  monopolyCard(players, player, resource){
    let sum = 0
    for (let i = 0; i < players.length; i++) {
      if(players[i].name != player.name) {
        switch (resource) {
          case 'grain':
            if(players[i].hand.resources.grain) {
              sum += players[i].hand.resources.grain
              players[i].hand.resources.grain = 0
            }
            break;
          case 'wool':
            if(players[i].hand.resources.wool) {
              sum += players[i].hand.resources.wool
              players[i].hand.resources.wool = 0
            }
            break;
          case 'ore':
            if(players[i].hand.resources.ore) {
              sum += players[i].hand.resources.ore
              players[i].hand.resources.ore = 0
            }
            break;
          case 'lumber':
            if(players[i].hand.resources.lumber) {
              sum += players[i].hand.resources.lumber
              players[i].hand.resources.lumber = 0
            }
            break;
          case 'brick':
            if(players[i].hand.resources.brick) {
              sum += players[i].hand.resources.brick
              players[i].hand.resources.brick = 0
            }
            break;
        }
      }
    }
    player.hand.development.monopoly--
    switch (resource) {
      case 'grain':
        player.hand.resources.grain += sum
        break;
      case 'wool':
        player.hand.resources.wool += sum
        break;
      case 'ore':
        player.hand.resources.ore += sum
        break;
      case 'lumber':
        player.hand.resources.lumber += sum
        break;
      case 'brick':
        player.hand.resources.brick += sum
        break;
    }
  }

  plentyCard(player, resources){
    player.hand.development.plenty--
    for (let i = 0; i < resources.length; i++) {
      switch (resources[i]) {
        case 'grain':
          player.hand.resources.grain++
          break;
        case 'wool':
          player.hand.resources.wool++
          break;
        case 'ore':
          player.hand.resources.ore++
          break;
        case 'lumber':
          player.hand.resources.lumber++
          break;
        case 'brick':
          player.hand.resources.brick++
          break;
      }
    }
  }

  transferOneToAnother(player, victimColor) {
    for (const playerVictim of this.playersInfo) {
      if (playerVictim.color === victimColor) {
        if (this.#isAnyResourse(playerVictim.hand.resources)) {
          const type = this.#chooseRandomResourse(playerVictim.hand.resources);
          playerVictim.hand.resources[type] -= 1;
          player.hand.resources[type] += 1;
        };
      }
    }
  }

  calculateMaxRoadChain(map, playersInfo) {
    for (const player of playersInfo) {
      if (map.longestRoad < 5 && player.roadChain === 5) {
        player.longestRoad = true;
        map.longestRoad = 5;
      }
      if (map.longestRoad >= 5 && player.roadChain > map.longestRoad) {
        for (const player of this.playersInfo) {
          player.longestRoad = false;
        }
        map.longestRoad = player.roadChain;
        player.longestRoad = true;
      }
    }
  }

  calculateMaxArmySize(map, playersInfo) {
    for (const player of playersInfo) {
      if (map.largestArmy < 3 && player.armySize === 3) {
        player.largestArmy = true;
        map.largestArmy = 3;
      }
      if (map.largestArmy >= 3 && player.armySize > map.largestArmy) {
        for (const player of playersInfo) {
          player.largestArmy = false;
        }
        map.largestArmy = player.armySize;
        player.largestArmy = true;
      }
    }
  }
}
