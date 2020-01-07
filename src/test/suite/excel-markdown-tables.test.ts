import * as assert from 'assert';

import * as emt from '../../excel-markdown-tables';

describe("Excel Markdown tables API Tests", () => {

    it("excelToMarkdown", () => {
        assert.equal(emt.excelToMarkdown("test"), "| test |\n|------|");
        assert.equal(emt.excelToMarkdown("one\ttwo\r\nthree"),"| one   | two |\n|-------|-----|\n| three |");
    });

    it("excelToMarkdown - Alignment", () => {
        assert.equal(emt.excelToMarkdown("^rtest"), "| test |\n|-----:|");
        assert.equal(emt.excelToMarkdown("^ctest"), "| test |\n|:----:|");
        assert.equal(emt.excelToMarkdown("^ltest"), "| test |\n|------|");
    });
});
