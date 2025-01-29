import { Component, Input } from '@angular/core';
import { albums } from '../data/albums-data';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-songs-list',
  standalone: true,
  imports: [NgFor, CommonModule, FormsModule],
  templateUrl: './songs-list.component.html',
  styleUrls: ['./songs-list.component.css']
})
export class SongsListComponent {
  albums = albums.map((album) => ({
    ...album, //spread operator (...): copia todas las propiedades existentes del objeto (en este caso album) al nuevo objeto
    selected: false, // Estado de selección del álbum
    songs: album.songs.map((song) => ({ ...song, selected: false }))
  }));

  //Selecciona o deselecciona todas las canciones del álbum cuando se selecciona el checkbox del álbum.
  toggleAlbumSelection(albumIndex: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const album = this.albums[albumIndex];
    album.selected = isChecked;
    album.songs.forEach((song) => (song.selected = isChecked));
  }

  //Actualiza el estado del checkbox del álbum en función de las canciones seleccionadas.
  updateAlbumSelection(albumIndex: number): void {
    const album = this.albums[albumIndex];
    const allSelected = album.songs.every((song) => song.selected);
    const noneSelected = album.songs.every((song) => !song.selected);

    if (allSelected) {
      album.selected = true;
    } else if (noneSelected) {
      album.selected = false;
    } else {
      // Indeterminado: Necesitamos forzar un estado visual si quisieras representarlo.
      album.selected = false;
    }
  }

  // Recibir tags seleccionados desde SelectionScreenComponent
  @Input() set selectedTags(tags: string[]) {
    this.updateSelection(tags);
  }

  // Actualizar selección según las tags seleccionadas
  updateSelection(tags: string[]): void {
    this.albums.forEach((album) => {
      album.songs.forEach((song) => {
        song.selected = tags.some((tag) => song.tags.includes(tag));
      });
    });
  }
}