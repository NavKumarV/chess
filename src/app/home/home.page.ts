import { Component, OnInit } from '@angular/core';
import { ChessBoard } from '../models/chess-board/chess-board';
import { WHITE_ROOK, WHITE_KNIGHT, WHITE_BISHOP, WHITE_KING, WHITE_QUEEN, WHITE_SOLDIER } from '../models/pawns/white-pawns';
import { BLACK_ROOK, BLACK_BISHOP, BLACK_KNIGHT, BLACK_KING, BLACK_QUEEN, BLACK_SOLDIER } from '../models/pawns/black-pawns';
import { PawnInterface } from '../models/interfaces/game-interfaces';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  playerTurn = 'white';
  showBoard = false;
  cIndex = -1;
  rIndex = -1;
  selectedPawn: PawnInterface | null;
  pawnSteps = [];
  chessBoardObj: any;
  kingsCoOrdinate = { whiteKing: { row: 0, col: 3 }, blackKing: { row: 7, col: 3 } };

  constructor(private alertCtrl: AlertController) { }

  ngOnInit() {
    this.initilizeBoard();
  }

  // Initilize the chess board
  async initilizeBoard() {
    this.chessBoardObj = ChessBoard.clearBoard;
    await this.initilizeWhiteKingdom();
    await this.initilizeBlackKingdom();
    this.showBoard = true;
  }

  // White Pawns Initilization
  initilizeWhiteKingdom() {
    this.chessBoardObj[0][0] = { ...WHITE_ROOK };
    this.chessBoardObj[0][1] = { ...WHITE_KNIGHT };
    this.chessBoardObj[0][2] = { ...WHITE_BISHOP };
    this.chessBoardObj[0][3] = { ...WHITE_KING };
    this.chessBoardObj[0][4] = { ...WHITE_QUEEN };
    this.chessBoardObj[0][5] = { ...WHITE_BISHOP };
    this.chessBoardObj[0][6] = { ...WHITE_KNIGHT };
    this.chessBoardObj[0][7] = { ...WHITE_ROOK };
    this.initilizeWhiteSoldiers();
  }

  // White Soldiers Initilization
  initilizeWhiteSoldiers() {
    for (let count = 0; count < 8; count++) {
      this.chessBoardObj[1][count] = { ...WHITE_SOLDIER };
      this.chessBoardObj[1][count].rowIndex = 1;
      this.chessBoardObj[1][count].colIndex = count;
    }
    console.log(this.chessBoardObj);
  }

  // Black Pawns Initilization
  initilizeBlackKingdom() {
    this.chessBoardObj[7][0] = { ...BLACK_ROOK };
    this.chessBoardObj[7][1] = { ...BLACK_KNIGHT };
    this.chessBoardObj[7][2] = { ...BLACK_BISHOP };
    this.chessBoardObj[7][3] = { ...BLACK_KING };
    this.chessBoardObj[7][4] = { ...BLACK_QUEEN };
    this.chessBoardObj[7][5] = { ...BLACK_BISHOP };
    this.chessBoardObj[7][6] = { ...BLACK_KNIGHT };
    this.chessBoardObj[7][7] = { ...BLACK_ROOK };
    this.initilizeBlackSoldiers();
  }

  // Black Soldiers Initilization
  initilizeBlackSoldiers() {
    for (let count = 0; count < 8; count++) {
      this.chessBoardObj[6][count] = { ...BLACK_SOLDIER };
      this.chessBoardObj[6][count].rowIndex = 1;
      this.chessBoardObj[6][count].colIndex = count;
    }
    console.log(this.chessBoardObj);
  }

  restrictMoment(chessCol: PawnInterface | null, r, c) {
    console.log(chessCol, r, c);
    // Blocks entire team based on Turns
    if (!this.selectedPawn) {
      if (chessCol && (chessCol.team === this.playerTurn)) {
        return false;
      }
      return true;
    }
    // Allows to select any pawn only from selected team.
    if (this.selectedPawn && chessCol && (chessCol.team === this.selectedPawn.team)) {
      return false;
    }
    // Blocks all steps except possible paths.
    if (this.cIndex !== -1 && this.rIndex !== -1) {
      for (let count = 0; count < this.pawnSteps.length; count++) {
        if ((r === this.pawnSteps[count].r) && (c === this.pawnSteps[count].c)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  // Colors the Chess Board on condition
  calcBoxColor(r, c) {
    return ((r + c) % 2 === 1);
  }

  calcHL(r, c) {
    return (r === this.rIndex && c === this.cIndex);
  }

  checkSteps(r, c) {
    for (let count = 0; count < this.pawnSteps.length; count++) {
      if (r === this.pawnSteps[count].r && c === this.pawnSteps[count].c) { return true; }
    }
    return false;
  }

  // Default Image
  errorHandler(event, r, c) {
    console.log(r, c);
    event.target.src = 'assets/pawns/default.png';
  }

  getImageOnIndex(chessCol, r, c) {
    if (chessCol) {
      return chessCol.img;
    }
    return 'assets/pawns/default.png';
  }

  // On select of Pawn
  selectPawn(chessCol: PawnInterface | null, r, c) {
    console.log(this.chessBoardObj);
    this.pawnSteps = [];
    if (this.cIndex !== -1 && this.rIndex !== -1) {
      if (chessCol && this.selectedPawn && chessCol.team === this.selectedPawn.team) {
        this.selectedPawn = chessCol; this.cIndex = c; this.rIndex = r;
        this.checkPawnConditions(chessCol, r, c);
      } else {

        // Checks the winner of the game.
        if (this.chessBoardObj[r][c] && this.chessBoardObj[r][c].name === 'KING') {
          const winnerTeam = this.selectedPawn.team;
          alert(winnerTeam + ' player wins.');
          return;
        }

        this.chessBoardObj[this.rIndex][this.cIndex] = null;
        this.chessBoardObj[r][c] = this.selectedPawn; this.cIndex = -1; this.rIndex = -1;
        this.pawnSteps = [];
        this.playerTurn = this.playerTurn === 'white' ? 'black' : 'white';
        this.selectedPawn = null;

        // Evolve the soldier at end of the line.
        if (r === 0 && this.chessBoardObj[r][c].name === 'SOLDIER' && this.chessBoardObj[r][c].team === 'black') {
          this.chooseSoldierEvolution('black', r, c);
        }
        if (r === 7 && this.chessBoardObj[r][c].name === 'SOLDIER' && this.chessBoardObj[r][c].team === 'white') {
          this.chooseSoldierEvolution('white', r, c);
        }
      }
    } else if (chessCol) {
      this.selectedPawn = chessCol; this.cIndex = c; this.rIndex = r;
      this.checkPawnConditions(chessCol, r, c);
    }
  }

  // Differentiating Pawns
  async checkPawnConditions(chessCol, r, c) {
    console.log(chessCol);
    if (chessCol.name === 'ROOK') {
      this.checkConditionRook(chessCol, r, c);
    }
    if (chessCol.name === 'BISHOP') {
      this.checkConditionBishop(chessCol, r, c);
    }
    if (chessCol.name === 'QUEEN') {
      await this.checkConditionRook(chessCol, r, c);
      await this.checkConditionBishop(chessCol, r, c);
    }
    if (chessCol.name === 'KING') {
      await this.checkConditionKing(chessCol, r, c);
    }
    if (chessCol.name === 'KNIGHT') {
      await this.checkConditionKnight(chessCol, r, c);
    }
    if (chessCol.name === 'SOLDIER' && chessCol.team === 'white') {
      await this.checkConditionWhiteSoldier(chessCol, r, c);
    }
    if (chessCol.name === 'SOLDIER' && chessCol.team === 'black') {
      await this.checkConditionBlackSoldier(chessCol, r, c);
    }
  }

  // Checks condition for ROOK & QUEEN
  async checkConditionRook(chessCol, r, c) {
    for (let count = r + 1; count < 8; count++) { if (await this.pushOnIndividualCondition(chessCol, count, c)) { break; } }
    for (let count = r - 1; count >= 0; count--) { if (await this.pushOnIndividualCondition(chessCol, count, c)) { break; } }
    for (let count = c + 1; count < 8; count++) { if (await this.pushOnIndividualCondition(chessCol, r, count)) { break; } }
    for (let count = c - 1; count >= 0; count--) { if (await this.pushOnIndividualCondition(chessCol, r, count)) { break; } }
    console.log(this.pawnSteps);
  }

  // Checks condition for BISHOP & QUEEN
  async checkConditionBishop(chessCol, r, c) {
    let c1 = c + 1, c2 = c - 1, c3 = c - 1, c4 = c + 1;
    for (let count = r + 1; (count < 8 && c1 < 8); count++) {
      if (await this.pushOnIndividualCondition(chessCol, count, c1)) { break; }
      c1 = c1 + 1;
    }
    for (let count = r - 1; (count >= 0 && c2 >= 0); count--) {
      if (await this.pushOnIndividualCondition(chessCol, count, c2)) { break; }
      c2 = c2 - 1;
    }
    for (let count = r + 1; (count < 8 && c3 >= 0); count++) {
      if (await this.pushOnIndividualCondition(chessCol, count, c3)) { break; }
      c3 = c3 - 1;
    }
    for (let count = r - 1; (count >= 0 && c4 < 8); count--) {
      if (await this.pushOnIndividualCondition(chessCol, count, c4)) { break; }
      c4 = c4 + 1;
    }
    console.log(this.pawnSteps);
  }

  // Checks condition for KNIGHT
  checkConditionKnight(chessCol, r, c) {
    const r1 = r + 1, r2 = r + 2, r3 = r - 1, r4 = r - 2;
    const c1 = c + 1, c2 = c + 2, c3 = c - 1, c4 = c - 2;
    if ((r1 < 8) && (c2 < 8)) { this.pushOnIndividualCondition(chessCol, r1, c2); }
    if ((r1 < 8) && (c4 >= 0)) { this.pushOnIndividualCondition(chessCol, r1, c4); }
    if ((r3 >= 0) && (c2 < 8)) { this.pushOnIndividualCondition(chessCol, r3, c2); }
    if ((r3 >= 0) && (c4 >= 0)) { this.pushOnIndividualCondition(chessCol, r3, c4); }
    if ((r2 < 8) && (c1 < 8)) { this.pushOnIndividualCondition(chessCol, r2, c1); }
    if ((r2 < 8) && (c3 >= 0)) { this.pushOnIndividualCondition(chessCol, r2, c3); }
    if ((r4 >= 0) && (c1 < 8)) { this.pushOnIndividualCondition(chessCol, r4, c1); }
    if ((r4 >= 0) && (c3 >= 0)) { this.pushOnIndividualCondition(chessCol, r4, c3); }
  }

  // Checks condition for KING
  checkConditionKing(chessCol: PawnInterface | null, r, c) {
    const r1 = r + 1, r2 = r - 1;
    const c1 = c + 1, c2 = c - 1;
    if ((r1 < 8) && (c1 < 8)) { this.pushOnIndividualCondition(chessCol, r1, c1); }
    if ((r2 >= 0) && (c2 >= 0)) { this.pushOnIndividualCondition(chessCol, r2, c2); }
    if ((r2 >= 0) && (c1 < 8)) { this.pushOnIndividualCondition(chessCol, r2, c1); }
    if ((r1 < 8) && (c2 >= 0)) { this.pushOnIndividualCondition(chessCol, r1, c2); }
    if ((r1 < 8)) { this.pushOnIndividualCondition(chessCol, r1, c); }
    if ((r2 >= 0)) { this.pushOnIndividualCondition(chessCol, r2, c); }
    if ((c1 < 8)) { this.pushOnIndividualCondition(chessCol, r, c1); }
    if ((c2 >= 0)) { this.pushOnIndividualCondition(chessCol, r, c2); }
    if (chessCol && this.selectedPawn && chessCol.team === this.selectedPawn.team) {

    }
  }

  // Based on Condition data will be pushed for ALL
  pushOnIndividualCondition(chessCol, r, c) {
    if (!this.chessBoardObj[r][c]) {
      this.pawnSteps.push({ r, c });
      return false;
    } else {
      this.breakCondition(chessCol, r, c);
      return true;
    }
  }

  // Check the TEAM of adjacent pawns
  breakCondition(chessCol, r, c) {
    if (this.chessBoardObj[r][c] && this.chessBoardObj[r][c].team !== chessCol.team) {
      this.pawnSteps.push({ r, c });
    }
  }

  checkConditionWhiteSoldier(chessCol, r, c) {
    if (r === 1) {
      if (!this.chessBoardObj[r + 1][c]) {
        this.pawnSteps.push({ r: r + 1, c });
      }
      if (!this.chessBoardObj[r + 1][c] && !this.chessBoardObj[r + 2][c]) {
        this.pawnSteps.push({ r: r + 2, c });
      }
    }
    if ((r !== 1) && (r + 1 < 8) && !this.chessBoardObj[r + 1][c]) {
      this.pawnSteps.push({ r: r + 1, c });
    }
    if ((r + 1 < 8) && (c + 1 < 8) && this.chessBoardObj[r + 1][c + 1] && (this.chessBoardObj[r + 1][c + 1].team !== chessCol.team)) {
      this.pawnSteps.push({ r: r + 1, c: c + 1 });
    }
    if ((r + 1 < 8) && (c - 1 >= 0) && this.chessBoardObj[r + 1][c - 1] && (this.chessBoardObj[r + 1][c - 1].team !== chessCol.team)) {
      this.pawnSteps.push({ r: r + 1, c: c - 1 });
    }
  }

  checkConditionBlackSoldier(chessCol, r, c) {
    if (r === 6) {
      if (!this.chessBoardObj[r - 1][c] && !this.chessBoardObj[r - 2][c]) {
        this.pawnSteps.push({ r: r - 1, c });
        this.pawnSteps.push({ r: r - 2, c });
      } else if (!this.chessBoardObj[r - 1][c]) {
        this.pawnSteps.push({ r: r - 1, c });
      }
    }
    if ((r !== 6) && (r - 1 >= 0) && !this.chessBoardObj[r - 1][c]) {
      this.pawnSteps.push({ r: r - 1, c });
    }
    if ((r - 1 >= 0) && (c + 1 < 8) && this.chessBoardObj[r - 1][c + 1] && (this.chessBoardObj[r - 1][c + 1].team !== chessCol.team)) {
      this.pawnSteps.push({ r: r - 1, c: c + 1 });
    }
    if ((r - 1 >= 0) && (c - 1 >= 0) && this.chessBoardObj[r - 1][c - 1] && (this.chessBoardObj[r - 1][c - 1].team !== chessCol.team)) {
      this.pawnSteps.push({ r: r - 1, c: c - 1 });
    }
  }

  preCheckKingsSafety(selectedPawn: PawnInterface, chessCol: PawnInterface, r, c) {
    // if (selectedPawn.team === 'white') {
    //   // this.checkWhiteKingSafety()
    //   for (let rowCount = 0; rowCount < 8; rowCount++) {
    //     for (let colCount = 0; colCount < 8; colCount++) {
    //       // this.checkPawnConditions(this.chessBoardObj);
    //     }
    //   }
    // }
  }

  assignKingValues(r, c, team) {
    if (team === 'white') {
      this.kingsCoOrdinate.whiteKing.row = r;
      this.kingsCoOrdinate.whiteKing.col = c;
    } else if (team === 'black') {
      this.kingsCoOrdinate.blackKing.row = r;
      this.kingsCoOrdinate.blackKing.col = c;
    }
  }

  async chooseSoldierEvolution(team, r, c) {
    const myAlert = await this.alertCtrl.create({
      header: 'Pawns',
      subHeader: 'Select your pawn',
      backdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          handler: pawn => {
            if (pawn) {
              this.evolveSoldier(team, r, c, pawn);
            }
          },
        }
      ],
      inputs: [
        {
          type: 'radio',
          id: 'queen',
          name: 'queen',
          label: 'Queen',
          value: 'queen',
          checked: true
        },
        {
          type: 'radio',
          id: 'bishop',
          name: 'bishop',
          label: 'Bishop',
          value: 'bishop',
          checked: false
        },
        {
          type: 'radio',
          id: 'knight',
          name: 'knight',
          label: 'Knight',
          value: 'knight',
          checked: false
        },
        {
          type: 'radio',
          id: 'rook',
          name: 'rook',
          label: 'Rook',
          value: 'rook',
          checked: false
        }
      ]
    });
    await myAlert.present();
  }

  evolveSoldier(team, r, c, pawn) {
    if (team === 'white') {
      if (pawn === 'queen') {
        this.chessBoardObj[r][c] = { ...WHITE_QUEEN };
      }
      if (pawn === 'bishop') {
        this.chessBoardObj[r][c] = { ...WHITE_BISHOP };
      }
      if (pawn === 'knight') {
        this.chessBoardObj[r][c] = { ...WHITE_KNIGHT };
      }
      if (pawn === 'rook') {
        this.chessBoardObj[r][c] = { ...WHITE_ROOK };
      }
    } else {
      if (pawn === 'queen') {
        this.chessBoardObj[r][c] = { ...BLACK_QUEEN };
      }
      if (pawn === 'bishop') {
        this.chessBoardObj[r][c] = { ...BLACK_BISHOP };
      }
      if (pawn === 'knight') {
        this.chessBoardObj[r][c] = { ...BLACK_KNIGHT };
      }
      if (pawn === 'rook') {
        this.chessBoardObj[r][c] = { ...BLACK_ROOK };
      }
    }
  }

}
