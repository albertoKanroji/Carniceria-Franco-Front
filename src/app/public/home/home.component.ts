import { Component, OnInit } from '@angular/core';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  precioOriginal?: number;
  imagen: string;
  categoria: string;
  descripcion: string;
  enOferta: boolean;
  stock: boolean;
  peso: string;
  calificacion: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  productos: Producto[] = [
    {
      id: 1,
      nombre: "Carne de Res Premium",
      precio: 45.90,
      precioOriginal: 52.00,
      imagen: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400",
      categoria: "Res",
      descripcion: "Corte premium de carne de res, ideal para asados y parrillas",
      enOferta: true,
      stock: true,
      peso: "1kg",
      calificacion: 5
    },
    {
      id: 2,
      nombre: "Pollo Entero Fresco",
      precio: 28.50,
      imagen: "https://images.unsplash.com/photo-1448907503123-67254d59ca4f?w=400",
      categoria: "Pollo",
      descripcion: "Pollo entero fresco de granja, perfecto para el horno",
      enOferta: false,
      stock: true,
      peso: "1.5kg",
      calificacion: 4
    },
    {
      id: 3,
      nombre: "Chuletas de Cerdo",
      precio: 38.75,
      precioOriginal: 42.00,
      imagen: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
      categoria: "Cerdo",
      descripcion: "Chuletas de cerdo jugosas y tiernas, marinadas",
      enOferta: true,
      stock: true,
      peso: "800g",
      calificacion: 5
    },
    {
      id: 4,
      nombre: "Filete de Pescado",
      precio: 55.25,
      imagen: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400",
      categoria: "Pescado",
      descripcion: "Filete fresco de pescado del día, alta calidad",
      enOferta: false,
      stock: true,
      peso: "500g",
      calificacion: 4
    },
    {
      id: 5,
      nombre: "Carne Molida Extra",
      precio: 32.90,
      imagen: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
      categoria: "Res",
      descripcion: "Carne molida de res extra magra, ideal para hamburguesas",
      enOferta: false,
      stock: true,
      peso: "1kg",
      calificacion: 4
    },
    {
      id: 6,
      nombre: "Costillas BBQ",
      precio: 48.60,
      precioOriginal: 54.00,
      imagen: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
      categoria: "Cerdo",
      descripcion: "Costillas de cerdo especiales para barbacoa",
      enOferta: true,
      stock: false,
      peso: "1.2kg",
      calificacion: 5
    },
    {
      id: 7,
      nombre: "Pechuga de Pollo",
      precio: 35.40,
      imagen: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
      categoria: "Pollo",
      descripcion: "Pechuga de pollo sin hueso, ideal para dietas saludables",
      enOferta: false,
      stock: true,
      peso: "600g",
      calificacion: 4
    },
    {
      id: 8,
      nombre: "Salmón Fresco",
      precio: 75.80,
      imagen: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400",
      categoria: "Pescado",
      descripcion: "Salmón fresco del Atlántico, rico en omega 3",
      enOferta: false,
      stock: true,
      peso: "400g",
      calificacion: 5
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  agregarAlCarrito(producto: Producto): void {
    console.log('Producto agregado al carrito:', producto);
    // Aquí implementarías la lógica para agregar al carrito
  }

  verDetalle(producto: Producto): void {
    console.log('Ver detalle del producto:', producto);
    // Aquí implementarías la navegación al detalle del producto
  }

  generarEstrellas(calificacion: number): string[] {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(i <= calificacion ? 'fas fa-star' : 'far fa-star');
    }
    return estrellas;
  }
}
