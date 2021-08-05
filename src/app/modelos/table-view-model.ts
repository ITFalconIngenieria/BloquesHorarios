export interface TableViewModel{
    IdBloques?: Number[],
    ClaseDia?: String | null,
    Tiempo?:{
        TotalHoras: Number[],
        Horarios?: Array<Array<{
            Horario: String,
            Id: Number
        }>>
        HorarioString?: String[]
    }
};