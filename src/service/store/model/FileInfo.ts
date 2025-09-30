export module Wds {
  export class FileInfo {
    id: number | undefined;
    ddlDate: string | undefined;
    name: string | undefined;
    path: string | undefined;
    size: number | undefined;
    type: string | undefined;
    lastModified: number | undefined;

    constructor(info: any) {
      if (info) {
        this.id = info.id;
        this.ddlDate = info.ddlDate;
        this.name = info.name;
        this.path = info.path;
        this.size = info.size;
        this.type = info.type;
        this.lastModified = info.lastModified;
      }
    }
  }
}
