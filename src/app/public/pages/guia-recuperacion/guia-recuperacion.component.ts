import { Component, OnInit } from '@angular/core';
declare var bootstrap: any;
@Component({
  selector: 'app-guia-recuperacion',
  templateUrl: './guia-recuperacion.component.html',
  styleUrls: ['./guia-recuperacion.component.css']
})
export class GuiaRecuperacionComponent implements OnInit {

  lesiones: { titulo: string, descripcion: string ,modal:string}[] = [];
  lesionSeleccionada: { titulo: string, descripcion: string,modal:string } | null = null;

  ngOnInit(): void {
    this.lesiones = [
      {
        titulo: 'Tendinitis',
        descripcion: 'La tendinitis es una de las lesiones más comunes...',
        modal:""
      },
      {
        titulo: 'Lumbalgia',
        descripcion: 'La lumbalgia es otra de las lesiones más comunes...',
        modal:""
      },
      {
        titulo: 'Roturas de fibras',
        descripcion: 'Si no realizamos un correcto calentamiento...',
        modal:""
      },
      {
        titulo: 'Contracturas',
        descripcion: 'Es una de las lesiones más comunes a nivel muscular...',
        modal:""
      },
      {
        titulo: 'Lesiones en la rodilla',
        descripcion: 'Esta articulación es una de las que más sufre...',
        modal:""
      },
      {
        titulo: 'Tendinopatías',
        descripcion: 'Son el conjunto de patologías que afectan al tendón...',
        modal: `
          <h6 class="fw-bold text-primary mt-3">🩺 Entendiendo la condición</h6>
          <p>La tendinopatía se refiere a una condición dolorosa que afecta a los tendones, causada por el uso excesivo, carga repetitiva o envejecimiento. A diferencia de la tendinitis (inflamación), implica cambios degenerativos en el tendón como los de Aquiles, rotuliana o del manguito rotador.</p>

          <h6 class="fw-bold text-primary mt-4">📅 Cuándo consultar a un especialista</h6>
          <ul>
            <li>Dolor severo y persistente</li>
            <li>Limitación funcional importante</li>
            <li>No mejora tras reposo o medicamentos</li>
            <li>Sospecha de rotura del tendón</li>
          </ul>

          <h6 class="fw-bold text-primary mt-4">⏱️ Tiempos de recuperación</h6>
          <p>La recuperación puede durar meses. Se inicia con fisioterapia, control de dolor y modificación de actividad. En casos graves se consideran inyecciones o cirugía.</p>

          <h6 class="fw-bold text-primary mt-4">✅ Qué hacer</h6>
          <ul>
            <li>Modificar actividad física</li>
            <li>Ejercicios de fisioterapia y fortalecimiento</li>
            <li>Estiramiento excéntrico</li>
            <li>Hielo postactividad</li>
            <li>Buena nutrición e hidratación</li>
          </ul>

          <h6 class="fw-bold text-danger mt-4">🚫 Qué evitar</h6>
          <ul>
            <li>Reposo total prolongado</li>
            <li>Movimientos de alto impacto</li>
            <li>Ignorar dolor persistente</li>
            <li>Retomar actividad sin rehabilitación</li>
          </ul>
        `
      },
      {
        titulo: 'Esguinces',
        descripcion: 'Un esguince es una lesión en los ligamentos...',
        modal:""
      },
      {
        titulo: 'Hernias discales',
        descripcion: 'Las hernias discales se producen cuando el disco...',
        modal:""
      },
      {
        titulo: 'Lesiones del manguito rotador',
        descripcion: 'El manguito rotador es un grupo de músculos y tendones...',
        modal:""
      },
      {
        titulo: 'Fracturas por estrés',
        descripcion: 'Las fracturas por estrés son pequeñas grietas...',
        modal:""
      },
      {
        titulo: 'Bursitis',
        descripcion: 'La bursitis es la inflamación de las bolsas llenas de líquido...',
        modal:""
      },
      {
        titulo: 'Síndrome de la banda iliotibial',
        descripcion: 'Este síndrome se produce cuando la banda iliotibial...',
        modal:""
      },
      {
        titulo: 'Epicondilitis',
        descripcion: 'También conocida como codo de tenista o golfista...',
        modal:""
      },
      {
        titulo: 'Fascitis plantar',
        descripcion: 'La fascitis plantar es una inflamación del tejido...',
        modal:""
      },
      {
        titulo: 'Luxaciones',
        descripcion: 'Una luxación ocurre cuando los huesos de una articulación...',
        modal:""
      },
      {
        titulo: 'Síndrome compartimental',
        descripcion: 'Es una condición dolorosa y peligrosa que ocurre cuando...',
        modal:""
      },
      {
        titulo: 'Cervicalgia',
        descripcion: 'Es el dolor en la región cervical (cuello)...',
        modal:""
      },
      {
        titulo: 'Periostitis tibial',
        descripcion: 'También conocida como "síndrome de la espinilla"...',
        modal:""
      },
      {
        titulo: 'Síndrome del túnel carpiano',
        descripcion: 'Es una condición que ocurre cuando el nervio mediano...',
        modal:""
      }
    ];
  }
  abrirModal(lesion: { titulo: string, descripcion: string ,modal:string}) {
    this.lesionSeleccionada = lesion;
    const modalElement = document.getElementById('modalGuia');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}
