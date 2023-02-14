export default class GameMaster {
  constructor(
    public activePlayer: number = 0,
    public players: number = 4,
    ) {}

    transferTurn() {
      this.activePlayer < this.players ? this.activePlayer += 1 : this.activePlayer = 0;
    }
}
