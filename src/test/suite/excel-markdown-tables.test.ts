import * as assert from 'assert';

import * as emt from '../../excel-markdown-tables';

describe("Excel Markdown tables API Tests", () => {

    it("excelToMarkdown", () => {
        assert.equal(emt.excelToMarkdown("test"), "| test |\n|------|");
        assert.equal(emt.excelToMarkdown("one\ttwo\r\nthree"),"| one   | two |\n|-------|-----|\n| three |     |");
    });

    it("excelToMarkdown - Alignment", () => {
        assert.equal(emt.excelToMarkdown("^rtest"), "| test |\n|-----:|");
        assert.equal(emt.excelToMarkdown("^ctest"), "| test |\n|:----:|");
        assert.equal(emt.excelToMarkdown("^ltest"), "| test |\n|------|");
    });

    it("excelToMarkdown - empty input", () => {
        assert.equal(emt.excelToMarkdown(""), "|  |\n|--|");
        assert.equal(emt.excelToMarkdown("   "), "|  |\n|--|");
    });

    it("excelToMarkdown - trims surrounding whitespace", () => {
        assert.equal(emt.excelToMarkdown("  test  "), "| test |\n|------|");
        assert.equal(emt.excelToMarkdown("\n a\tb \n"), "| a | b |\n|---|---|");
    });

    it("excelToMarkdown - single cell with alignment", () => {
        assert.equal(emt.excelToMarkdown("^chello"), "| hello |\n|:-----:|");
        assert.equal(emt.excelToMarkdown("^rhello"), "| hello |\n|------:|");
    });

    it("excelToMarkdown - rows with fewer columns than header", () => {
        assert.equal(
            emt.excelToMarkdown("col1\tcol2\tcol3\r\na\tb"),
            "| col1 | col2 | col3 |\n|------|------|------|\n| a    | b    |      |"
        );
        assert.equal(
            emt.excelToMarkdown("one\ttwo\r\nthree"),
            "| one   | two |\n|-------|-----|\n| three |     |"
        );
    });

    it("excelToMarkdown - intra-cell newlines", () => {
        assert.equal(
            emt.excelToMarkdown("header\r\n\"line1\nline2\""),
            "| header          |\n|-----------------|\n| line1<br/>line2 |"
        );
    });

    it("excelToMarkdown - escapes pipe characters in cell content", () => {
        assert.equal(
            emt.excelToMarkdown("name\tvalue\r\na|b\tc"),
            "| name | value |\n|------|-------|\n| a\\|b | c     |"
        );
        assert.equal(
            emt.excelToMarkdown("a|b|c"),
            "| a\\|b\\|c |\n|---------|"
        );
    });

    it("excelToMarkdown - empty first header column (issue #36)", () => {
        assert.equal(
            emt.excelToMarkdown("\tcol2\tcol3\r\nval1\tval2\tval3"),
            "|      | col2 | col3 |\n|------|------|------|\n| val1 | val2 | val3 |"
        );
    });
});
