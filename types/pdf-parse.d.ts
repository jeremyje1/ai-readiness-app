declare module 'pdf-parse' {
    interface Options {
        pagerender?: (pageData: any) => string
        max?: number
        version?: string
    }

    interface Result {
        numpages: number
        numrender: number
        info: any
        metadata: any
        version: string
        text: string
    }

    function pdfParse(buffer: Buffer, options?: Options): Promise<Result>
    export = pdfParse
}
