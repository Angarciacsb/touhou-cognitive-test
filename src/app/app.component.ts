import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SelectionScreenComponent } from './selection-screen/selection-screen.component';
import { GameplayScreenComponent } from "./gameplay-screen/gameplay-screen.component";
import { ScoreScreenComponent } from './score-screen/score-screen.component';

@Component({
  selector: 'app-root',
  
  imports: [RouterOutlet/*, RouterLink, RouterLinkActive, SelectionScreenComponent, GameplayScreenComponent, ScoreScreenComponent*/],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'touhou-cognitive-test';

  selectedTags: string[] = []; // Estado global para las tags seleccionadas

  // Manejar la actualización de tags
  onTagsUpdated(tags: string[]): void {
    this.selectedTags = tags;
  }
}
