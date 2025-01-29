import { Routes } from '@angular/router';
import { SelectionScreenComponent } from './selection-screen/selection-screen.component';
import { GameplayScreenComponent } from './gameplay-screen/gameplay-screen.component';
import { ScoreScreenComponent } from './score-screen/score-screen.component';

export const routes: Routes = [
    {path: 'selection-screen', title: 'Selection sceen', component: SelectionScreenComponent},
    {path: 'gameplay-screen', title: 'Gameplay screen', component: GameplayScreenComponent},
    {path: 'score-screen', title: 'Score screen', component: ScoreScreenComponent},
    {path: '**', redirectTo: '/selection-screen'} //Redirección por defecto
];
