import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriasService, Categoria } from 'src/services/categorias/categorias.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {

  categorias: Categoria[] = [];
  cargando: boolean = false;
  error: string | null = null;

  constructor(
    private categoriasService: CategoriasService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.error = null;

    this.categoriasService.getCategorias().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.categorias = response.data;
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.error = 'No se pudieron cargar las categorías. Por favor, intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  get categoriasDestacadas(): Categoria[] {
    // Las primeras 6 categorías se consideran destacadas, o puedes usar otro criterio
    return this.categorias.slice(0, 6);
  }

  verCategoria(categoria: Categoria): void {
    // Navegar a productos filtrando por categoría
    this.router.navigate(['/pages/productos'], {
      queryParams: { categoria: categoria.id }
    });
  }

  getImagenUrl(imagen: string | null): string {
    if (!imagen) {
      return 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500';
    }
    // Si la imagen es una URL completa, usarla directamente
    if (imagen.startsWith('http')) {
      return imagen;
    }
    // Si es una ruta relativa del backend, construir URL completa
    return `${environment.apiUrl.replace('/api/v1', '')}/${imagen}`;
  }
}
