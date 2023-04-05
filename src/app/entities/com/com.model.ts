

export interface ICom {
    from_id?: string | undefined,
    from_obj_id?: string | undefined,
    from_obj?: string | undefined,
    level?: string | undefined,
    text?: string | undefined,
    state?: string | undefined,
    icon?: string | undefined,
    delta?: string | undefined,
    time?: Date | undefined,
    object?: {} | undefined,
    saved?: boolean
}


export class Com implements ICom{
    constructor(
        public from_id?: string | undefined,
        public from_obj_id?: string | undefined,
        public from_obj?: string | undefined,
        public level?: string | undefined,
        public text?: string | undefined,
        public state?: string | undefined,
        public icon?: string | undefined,
        public delta?: string | undefined,
        public time?: Date | undefined,
        public object?: {} | undefined,
        public saved?: boolean | false,

    ) {
        this.from_id = from_id ? from_id : undefined;
        this.from_obj_id = from_obj_id ? from_obj_id : undefined;
        this.from_obj = from_obj ? from_obj : undefined;
        this.level = level ? level : 'log';
        this.state = state ? state : 'root';
        this.icon = icon ? icon : 'message';
        this.delta = delta ? delta : undefined;
        this.time = new Date();
        this.object = object ? object : {};
        this.saved = false;
    }

}