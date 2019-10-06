"use strict";


class option {
    constructor(name, table) {
        this.name_ = name;
        this.table_ = table;
    }
    
    
    get name()  { return this.name_; }
    set name(n) { this.name_ = n; }
    
    get table()  { return this.table_; }
    set table(t) { this.table_ = t; }
}
