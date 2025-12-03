import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductosService, Producto } from 'src/services/productos/productos.service';
import { CategoriasService, Categoria } from 'src/services/categorias/categorias.service';
import { CarritoService } from 'src/services/carrito/carrito.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];
  categoriaSeleccionada: number | null = null;
  loading = false;
  loadingCategorias = false;

  constructor(
    private productosService: ProductosService,
    private categoriasService: CategoriasService,
    private carritoService: CarritoService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProductos();
  }

  cargarCategorias(): void {
    this.loadingCategorias = true;
    this.categoriasService.getCategorias().subscribe({
      next: (response) => {
        if (response.success) {
          this.categorias = Array.isArray(response.data) ? response.data : [response.data];
        }
        this.loadingCategorias = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.loadingCategorias = false;
      }
    });
  }

  cargarProductos(categoriaId?: number): void {
    this.loading = true;

    const observable = categoriaId
      ? this.categoriasService.getProductosCategoria(categoriaId)
      : this.productosService.getProductos();

    observable.subscribe({
      next: (response: any) => {
        if (response.success) {
          this.productos = Array.isArray(response.data) ? response.data : [response.data];
          this.productosFiltrados = [...this.productos];
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.toastr.error('Error al cargar productos', 'Error');
        this.loading = false;
      }
    });
  }

  filtrarPorCategoria(categoriaId: number | null): void {
    this.categoriaSeleccionada = categoriaId;
    if (categoriaId === null) {
      this.cargarProductos();
    } else {
      this.cargarProductos(categoriaId);
    }
  }

  agregarAlCarrito(producto: Producto): void {
    if (producto.stock > 0) {
      this.carritoService.agregarProducto(producto, 1);
      this.toastr.success(`${producto.nombre} agregado al carrito`, 'Producto Agregado');
    } else {
      this.toastr.warning('Producto sin stock', 'No Disponible');
    }
  }

  verDetalle(producto: Producto): void {
    this.router.navigate(['/pages/productos']);
  }

  verProductos(): void {
    this.router.navigate(['/pages/productos']);
  }

  getImagenProducto(imagen: string | null): string {
    if (!imagen) {
      return 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400';
    }
    if (imagen.startsWith('http')) {
      return imagen;
    }
    return `${environment.apiUrl.replace('/api/v1', '')}/${imagen}`;
  }

  generarEstrellas(producto: Producto): string[] {
    // Generar calificación aleatoria entre 4 y 5 basada en el ID del producto
    const calificacion = producto.id % 2 === 0 ? 5 : 4;
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(i <= calificacion ? 'fas fa-star' : 'far fa-star');
    }
    return estrellas;
  }

  getCalificacion(producto: Producto): number {
    return producto.id % 2 === 0 ? 5 : 4;
  }
}
