import { ClaseDiaModel } from "./clase-dia-model";
import { MatrizHorariaModel } from "./matriz-horaria-model";
import { PeriodoModel } from "./periodo-model";

export interface BloqueHorarioModel {
    id: Number,
    periodoId:Number,
    claseDiaId:Number,
    matrizHorariaId:Number,
    observacion:String,
    descripcion: String,
    estado:Boolean
    matrizHoraria: MatrizHorariaModel,
    claseDia: ClaseDiaModel
    periodo: PeriodoModel
}
