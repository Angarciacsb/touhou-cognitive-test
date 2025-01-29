import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-score-screen',
  imports: [RouterLink, CommonModule],
  templateUrl: './score-screen.component.html',
  styleUrl: './score-screen.component.css'
})
export class ScoreScreenComponent {
  questionsArray: any[] = [];
  answersArray: any[] = [];
  score: number = 0;

  ngOnInit(): void {
    const state = history.state;
    if (state.questions && state.answers) {
      this.questionsArray = state.questions;
      this.answersArray = state.answers;
    }

    this.rateScore();
    //this.recorrerArray();
  }

  rateScore() {
    this.score = 0;
    for (let i = 0; i < this.answersArray.length; i++) {
      //?. es un operador de encadenamiento opcional. Si lo que va antes de ? es null o undefined, no se ejecuta lo que va después de ?
      if (this.answersArray[i]?.name === this.questionsArray[i]?.name) {
        this.score++;
        this.answersArray[i].isCorrect = true;
        console.log(this.answersArray[i].name);
      }else {
        this.answersArray[i].isCorrect = false;
      }
    }
  }

  recorrerArray() {
    console.log(this.questionsArray.length + ' Questions:');
    this.questionsArray.forEach((question, index) => {
      console.log(index + ". " + question.name);
    });
    console.log(this.answersArray.length + ' Answers:');
    this.answersArray.forEach((answer, index) => {
      console.log(index + ". " + answer.name);
    });
  }
}