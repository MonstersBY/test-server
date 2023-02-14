import State from "./State/State";

export default class Room {
  constructor(
    // private params: string,
    public mode: string = "newbie",
    public players: number = 1,
    public state?: State,
    ) {}

  init() {
    this.addPlayerNumberListener();
    this.addGameModeListener();
  }

  // pseudocode, need to specify
  addPlayerNumberListener() {
    // document.querySelector("#players-list")?.addEventListener("change", e => {
    //   this.players = e.target.value;
    // });
  }

  // pseudocode, need to specify
  addGameModeListener() {
    // document.querySelector("#game-mode")?.addEventListener("change", e => {
    //   this.mode = (e.target.checked) ? "random" : "newbie"; 
    // });
  }

}
