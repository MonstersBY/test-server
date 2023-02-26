export default function roadCounter(map, playerColor, roadId) {
  let roadChainLength = 1;

  // Узнаём тип дороги N | S | W
  const rootRoadDrection = roadId.split("_")[2];

  // Делаем список из всех достунпых (4х) веток идущих от основного узла дороги
  const nearRoads = closestRoads(map, roadId);

  // Сортируем его. Меньший гекс, N < S < W
  nearRoads.sort((a, b) => {
    return Number(a.split("_")[0]) === Number(b.split("_")[0])
      ? a.split("_")[2] < b.split("_")[2] ? -1 : 1
      : Number(a.split("_")[0]) - Number(b.split("_")[0])
  })  // const nearRoads = ["1_road_S", "5_road_N", "5_road_S", "9_road_N" ]

  // Два списка для разнонаправленных сторон
  const sideOne = [];
  const sideTwo = [];
  const nearRoadCount = nearRoads.length;

  // В зависимости от типа дороги раскидываем соседние ветки по двум сторонам
  switch (rootRoadDrection) {
    case "W":
      sideTwo.push(nearRoads.pop() || "") // левый нижний | правый нижний
      sideOne.push(nearRoads.shift() || "") // левый верхний | правый верхний
      if (nearRoads.length === 2) {
        sideTwo.push(nearRoads.pop() || "") // правый нижний
        sideOne.push(nearRoads.pop() || "") // правый верхний
      } else if(nearRoads.length === 1) {
        const lastRoadDrection = nearRoads[0].split("_")[2];
        lastRoadDrection === "N"
          ? sideOne.push(nearRoads.pop())
          : sideTwo.push(nearRoads.pop())
      }
    break;

    case "N":
      if (nearRoadCount === 2) {  // ["1_road_S", "2_road_W"]
        sideTwo.push(nearRoads.pop() || "")
        sideOne.push(nearRoads.pop() || "")
      }
      if (nearRoadCount === 3) {
        sideTwo.push(nearRoads.shift() || "");
        if (nearRoads[0].split("_")[2] === "S") { // первой была "1_road_S" и есть "2_road_S"
          sideOne.push(nearRoads.shift() || "");
          Number(nearRoads[0].split("_")[0]) === Number(sideOne[0].split("_")[0])
            ? sideOne.push(nearRoads.pop()) // ["1_road_S", "2_road_S", "2_road_W"]
            : sideTwo.push(nearRoads.pop()) // ["1_road_S", "2_road_S", "5_road_W"]
        } else {// нет "1_road_S" или "2_road_S"
          if (Number(sideTwo[0].split("_")[0]) === Number(nearRoads[0].split("_")[0])) {
            sideTwo.push(nearRoads.shift())
            sideOne.push(nearRoads.pop()) // ["2_road_S", "2_road_W", "5_road_W"]
          } else {
            sideOne.push(nearRoads.shift())
            sideTwo.push(nearRoads.pop()) // ["1_road_S", "2_road_W", "5_road_W"]
          }
        }
      }
      if (nearRoadCount === 4) { // ["1_road_S", "2_road_S", "2_road_W", "5_road_W"]
        sideTwo.push(nearRoads.pop() || "");
        sideTwo.push(nearRoads.shift() || "");
        sideOne.push(nearRoads.pop() || "");
        sideOne.push(nearRoads.pop() || "");
      }
    break;

    case "S":
      if (nearRoadCount === 2) {  // ["5_road_W", "10_road_N"]
        sideTwo.push(nearRoads.pop())
        sideOne.push(nearRoads.pop())
      }
      if (nearRoadCount === 3) {
        sideTwo.push(nearRoads.pop());
        if (Number(nearRoads[nearRoads.length - 1].split("_")[0]) === Number(sideTwo[0].split("_")[0])) {
          sideTwo.push(nearRoads.pop()); // ["9_road_N", "10_road_N", "10_road_W",]
          sideOne.push(nearRoads.pop()); // ["5_road_W", "10_road_N", "10_road_W",]
        } else {
          sideOne.push(nearRoads.pop()); // ["9_road_N", "5_road_W", "10_road_W"]
          sideOne.push(nearRoads.pop()); // ["9_road_N", "5_road_W", "10_road_N"]
        }
      }
      if (nearRoadCount === 4) { // ["9_road_N", "5_road_W", "10_road_N", "10_road_W",]
        sideTwo.push(nearRoads.pop());
        sideTwo.push(nearRoads.pop());
        sideOne.push(nearRoads.pop());
        sideOne.push(nearRoads.pop());
      }
    break;
  }

  // console.log("_________________________________________")
  // console.log("Первыя сторона", sideOne)
  // console.log("вторая сторона", sideTwo)

  const tailOneNearRoads =
    closestRoads(map, sideOne[0]).filter((e) => e !== roadId && (sideOne[1] ? e !== sideOne[1] : true))
  let tailOne = [
      tailOneNearRoads,
      recursiveCounter(map, playerColor, sideOne[0], [], [roadId, ...nearRoads])  //, ...tailOneNearRoads
  ]

  const tailTwoNearRoads =
    closestRoads(map, sideTwo[0]).filter((e) => e !== roadId && (sideTwo[1] ? e !== sideTwo[1] : true))
  let tailTwo  = [
    tailTwoNearRoads,
    recursiveCounter(map, playerColor, sideTwo[0], [], [roadId, ...nearRoads])
  ]

  if (sideOne[1]) {
    const tailnextOneNearRoads =
      closestRoads(map, sideOne[1]).filter((e) => e !== roadId && e !== sideOne[0])
    const nextOne = [
      tailnextOneNearRoads,
      recursiveCounter(map, playerColor, sideOne[1], [], [roadId, ...nearRoads])
    ]
    // console.log("первый со первой: ", tailOne[1].length, "второй со первой: ", nextOne[1].length)
    if (tailOne[1].length < nextOne[1].length) {
      tailOne = [...nextOne];
    }
  }

  if (sideTwo[1]) {
    const tailnextTwoNearRoads =
      closestRoads(map, sideTwo[1]).filter((e) => e !== roadId && e !== sideTwo[0])
    const nextTwo = [
      tailnextTwoNearRoads,
      recursiveCounter(map, playerColor, sideTwo[1], [], [roadId, ...nearRoads])
    ]
    // console.log("первый со второй: ", tailTwo[1].length, "второй со второй: ", nextTwo[1].length)
    if (tailTwo[1].length < nextTwo[1].length) {
      tailTwo = [...nextTwo];
    }
  }

  // console.log("_________________________________________")
  // console.log("Длинна хвоста 1: ", tailOne.length)
  // console.log("Длинна хвоста 2: ", tailTwo.length)

  const allRoadChainWithoutDubles = new Set([...tailOne[1], ...tailTwo[1], roadId])
  // console.log("_________________________________________")
  // console.log(allRoadChainWithoutDubles)
  return Array.from(allRoadChainWithoutDubles).length || roadChainLength;
}

function closestRoads(map, id) {
  // Берём конкретный узел в map
  const hex = id.split("_")[0];
  const hode = "road_" + id.split("_")[2];

  // Делаем список соседних узлов (поселения)
  const nearNodes = map[hex][hode].nextNodes;
  // Заводим пустой список для соседних дорог
  let nearRoads = [];

  // Кладём в список nearRoads ближайщие дороги
  for (let i = 0; i < nearNodes.length; i++) {
    const hex = nearNodes[i].split("_")[0];
    const settlementId = "settlement_" + nearNodes[i].split("_")[2];
    nearRoads.push(...map[hex][settlementId].nextNodes);
  }
  const nearRoadsSet = new Set(nearRoads);

  // Убираем изначальную дорогу
  nearRoadsSet.delete(id);
  nearRoads = [...nearRoadsSet];
  return nearRoads;
}

function recursiveCounter(map, playerColor, id, initialChain = [], prevRoads = []) {
  // console.log("start:", id, initialChain, prevRoads);
  // Если узел уже в цепочке - это тупик
  if (initialChain.includes(id)) {
    // console.log("my tail")
    return []
  }
  let chain = initialChain;

  // Берём конкретный узел
  const hex = id.split("_")[0];
  const hode = "road_" + id.split("_")[2];

  // Если там нет дороги нужного цвета - это тупик
  if (map[hex][hode].player !== playerColor) { 
    // console.log("dead end")
    return [];  // initialChain ????
  }

  // Кладём его имя в цепочку
  chain.push(id);

  // Делаем список соседних узлов (поселения)
  const nearNodes = map[hex][hode].nextNodes;
  // Заводим пустой список для соседних дорог
  const nearRoads = [];

  // Кладём в список nearRoads ближайщие дороги
  for (let i = 0; i < nearNodes.length; i++) {
    const hex = nearNodes[i].split("_")[0];
    const settlementId = "settlement_" + nearNodes[i].split("_")[2];
    nearRoads.push(...map[hex][settlementId].nextNodes);
  }
  const nearRoadsSet = new Set(nearRoads);

  // nearRoadsSet.delete(id);
  nearRoads.push(...nearRoadsSet);
  // console.log(id, "near: ", nearRoads);

  // Если у нас была предидущая дорога
    // console.log("near and prev:", nearRoads, prevRoads)
    // Убираем из ближайших те, которые ведут в другую сторону
  prevRoads.push(nearRoads.filter(road => !prevRoads.includes(road)));
  // console.log(id, "cleaned near: ", nearRoads);

  const longest = [];
  // Проходим по ответвлениям
  nearRoads.forEach((road) => {
    // console.log("NEW: ", road);
    const path = recursiveCounter(map, playerColor, road, chain, prevRoads);
    // Если длинна ветки больше 0 и других
    // console.log("моя текущая длинна: ", path.length);
    if (path.length >= longest.length) {
      longest.push(...path);
    }
  })
  chain.push(...longest);

  // Удаляю совпадения
  chain = [...new Set(chain)];
  // console.log(id, "возвращаю chain:", chain)
  return chain; // возвращаем список из дорог текущей ветки
}
