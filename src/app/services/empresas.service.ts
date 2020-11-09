import { Injectable } from '@angular/core';

@Injectable()
export class EmpresasService {

  constructor() { }

}
import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpParams
} from "@angular/common/http";
import { of } from "rxjs";
import { Empresas } from "../models/empresa";

@Injectable({
  providedIn: "root"
})
export class ArticulosService {
  resourceUrl: string;
  constructor(private httpClient: HttpClient) {
    // la barra al final del resourse url es importante para los metodos que concatenan el id del recurso (GetById, Put)
    //this.resourceUrl = "https://pavii.ddns.net/api/articulos/";
    //this.resourceUrl = "https://bitgocba.duckdns.org/api/Articulos/";
    this.resourceUrl = "https://pav2.azurewebsites.net/api/empresas/";

  }
  import { Component, OnInit } from "@angular/core";
import { Empresas } from "../../models/empresa";
import { ArticuloFamilia } from "../../models/articulo-familia";
import { MockArticulosService } from "../../services/mock-articulos.service";
import { MockArticulosFamiliasService } from "../../services/mock-articulos-familias.service";
//import { ServiciosService } from "../../services/servicios.service";
import { ArticulosFamiliasService } from "../../services/articulos-familias.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalDialogService } from "../../services/modal-dialog.service";
@Component({
selector: "app-articulos",
templateUrl: "./empresas.component.html",
styleUrls: ["./empresas.component.css"]
}
})
export class ArticulosComponent implements OnInit {
Titulo = "Empresas";
TituloAccionABMC = {
A: "(Agregar)",
B: "(Eliminar)",
M: "(Modificar)",
C: "(Consultar)",
L: "(Listado)"
};
AccionABMC = "L"; // inicialmente inicia en el listado de articulos (buscar con parametros)
Mensajes = {
SD: " No se encontraron registros...",
RD: " Revisar los datos ingresados..."
};
Lista: Articulo[] = [];
RegistrosTotal: number;
Familias: ArticuloFamilia[] = [];
SinBusquedasRealizadas = true;
Pagina = 1; // inicia pagina 1
// opciones del combo activo
OpcionesActivo = [
{ Id: null, Nombre: "" },
{ Id: true, Nombre: "SI" },
{ Id: false, Nombre: "NO" }
];
FormFiltro: FormGroup;
FormReg: FormGroup;
submitted = false;
constructor(
public formBuilder: FormBuilder,
//private articulosService: MockArticulosService,
//private articulosFamiliasService: MockArticulosFamiliasService,
private serviciosService: ServiciosService,
private articulosFamiliasService: ArticulosFamiliasService,
private modalDialogService: ModalDialogService
) {}
ngOnInit() {
this.FormFiltro = this.formBuilder.group({
Nombre: [""],
Activo: [true]
});
this.FormReg = this.formBuilder.group({
IdArticulo: [0],
Nombre: [
"",
[Validators.required, Validators.minLength(4), Validators.maxLength(55)]
],
Precio: [null, [Validators.required, Validators.pattern("[0-9]{1,7}")]],
Stock: [null, [Validators.required, Validators.pattern("[0-9]{1,7}")]],
CodigoDeBarra: [
"",
[Validators.required, Validators.pattern("[0-9]{13}")]
],
IdArticuloFamilia: ["", [Validators.required]],
FechaAlta: [
"",
[
Validators.required,
Validators.pattern(
"(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}"
)
]
],
Activo: [true]
});
this.GetFamiliasArticulos();
}
GetFamiliasArticulos() {
this.articulosFamiliasService.get().subscribe((res: ArticuloFamilia[]) => {
this.Familias = res;
});
}
Agregar() {
this.AccionABMC = "A";
this.FormReg.reset({ Activo: true });
this.submitted = false;
//this.FormReg.markAsPristine();
this.FormReg.markAsUntouched();
}
// Buscar segun los filtros, establecidos en FormReg
Buscar() {
this.SinBusquedasRealizadas = false;
this.serviciosService
.get(
)
.subscribe((res: any) => {
this.Lista = res.Lista;
this.RegistrosTotal = res.RegistrosTotal;
});
}
// Obtengo un registro especifico según el Id
BuscarPorId(Dto, AccionABMC) {
window.scroll(0, 0); // ir al incio del scroll
this.articulosService.getById(Dto.IdArticulo).subscribe((res: any) => {
this.FormReg.patchValue(res);
//formatear fecha de ISO 8061 a string dd/MM/yyyy
var arrFecha = res.FechaAlta.substr(0, 10).split("-");
this.FormReg.controls.FechaAlta.patchValue(
arrFecha[2] + "/" + arrFecha[1] + "/" + arrFecha[0]
);
this.AccionABMC = AccionABMC;
});
}
Consultar(Dto) {
this.BuscarPorId(Dto, "C");
}
// comienza la modificacion, luego la confirma con el metodo Grabar
Modificar(Dto) {
if (!Dto.Activo) {
this.modalDialogService.Alert(
"No puede modificarse un registro Inactivo."
);
return;
}
this.submitted = false;
this.FormReg.markAsPristine();
this.FormReg.markAsUntouched();
this.BuscarPorId(Dto, "M");
}
// grabar tanto altas como modificaciones
Grabar() {
this.submitted = true;
// verificar que los validadores esten OK
if (this.FormReg.invalid) {
return;
}
//hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
const itemCopy = { ...this.FormReg.value };
//convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
var arrFecha = itemCopy.FechaAlta.substr(0, 10).split("/");
if (arrFecha.length == 3)
itemCopy.FechaAlta = new Date(
arrFecha[2],
arrFecha[1] - 1,
arrFecha[0]
).toISOString();
// agregar post
if (itemCopy.IdArticulo == 0 || itemCopy.IdArticulo == null) {
itemCopy.IdArticulo = 0;
this.serviciosService.post(itemCopy).subscribe((res: any) => {
this.Volver();
this.modalDialogService.Alert("Registro agregado correctamente.");
this.Buscar();
});
} else {
// modificar put
this.articulosService
.put(itemCopy.IdArticulo, itemCopy)
.subscribe((res: any) => {
this.Volver();
this.modalDialogService.Alert("Registro modificado correctamente.");
this.Buscar();
});
}
}
