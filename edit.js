const fs = require('fs');
const content = fs.readFileSync('constants.ts', 'utf8');
const target = `        { id: "3.10", title: "Precedência de Riscos", blocks: [{ type: "paragraph", content: "Para substâncias com múltiplos riscos não listadas na Tabela 4.2, a classificação é determinada pela Tabela de Precedência de Riscos (Tabela 3.10.A), que define qual risco tem prioridade." }, { type: "note", content: { title: "Referência Cruzada", text: "A Tabela 3.10.A é fundamental para a classificação correta de substâncias com múltiplos perigos." } } ] }`;
const replacement = `        { id: "3.10", title: "Precedência de Riscos", blocks: [
            { type: "paragraph", content: "Para substâncias com múltiplos riscos não listadas na Tabela 4.2, a classificação é determinada pela Tabela de Precedência de Riscos (Tabela 3.10.A), que define qual risco tem prioridade." }, 
            { type: "note", content: { title: "Referência Cruzada", text: "A Tabela 3.10.A é fundamental para a classificação correta de substâncias com múltiplos perigos." } },
            { type: "table", content: {
                caption: "Tabela 3.10.A - Precedência de Riscos (Simplificada)",
                type: "matrix",
                headers: ["Classe/Divisão", "4.2", "4.3", "5.1", "5.2", "6.1, I (Oral)", "6.1, I (Dermal)", "6.1, II", "6.1, III", "8, I Líquido", "8, I Sólido", "8, II Líquido", "8, II Sólido", "8, III Líquido", "8, III Sólido"],
                rows: [
                    ["3, I", "4.2", "4.3", "3", "5.2", "6.1", "3", "3", "3", "3", "3", "3", "3", "3", "3"],
                    ["3, II", "4.2", "4.3", "3", "5.2", "6.1", "6.1", "3", "3", "8", "3", "3", "3", "3", "3"],
                    ["3, III", "4.2", "4.3", "3", "5.2", "6.1", "6.1", "6.1", "3", "8", "8", "8", "8", "3", "3"],
                    ["4.1, II", "4.2", "4.3", "5.1", "5.2", "6.1", "6.1", "4.1", "4.1", "8", "8", "4.1", "4.1", "4.1", "4.1"],
                    ["4.1, III", "4.2", "4.3", "5.1", "5.2", "6.1", "6.1", "6.1", "4.1", "8", "8", "8", "8", "4.1", "4.1"],
                    ["4.2, II", "-", "4.3", "5.1", "5.2", "6.1", "6.1", "4.2", "4.2", "8", "8", "4.2", "4.2", "4.2", "4.2"],
                    ["4.2, III", "-", "4.3", "5.1", "5.2", "6.1", "6.1", "6.1", "4.2", "8", "8", "8", "8", "4.2", "4.2"],
                    ["4.3, I", "-", "-", "5.1", "5.2", "6.1", "4.3", "4.3", "4.3", "4.3", "4.3", "4.3", "4.3", "4.3", "4.3"],
                    ["4.3, II", "-", "-", "5.1", "5.2", "6.1", "4.3", "4.3", "4.3", "8", "8", "4.3", "4.3", "4.3", "4.3"],
                    ["4.3, III", "-", "-", "5.1", "5.2", "6.1", "6.1", "6.1", "4.3", "8", "8", "8", "8", "4.3", "4.3"],
                    ["5.1, I", "-", "-", "-", "5.2", "6.1", "5.1", "5.1", "5.1", "5.1", "5.1", "5.1", "5.1", "5.1", "5.1"],
                    ["5.1, II", "-", "-", "-", "5.2", "6.1", "6.1", "5.1", "5.1", "8", "8", "5.1", "5.1", "5.1", "5.1"],
                    ["5.1, III", "-", "-", "-", "5.2", "6.1", "6.1", "6.1", "5.1", "8", "8", "8", "8", "5.1", "5.1"]
                ],
                footnotes: ["Nota: Esta tabela é uma versão simplificada. Consulte o IATA DGR original para a Tabela 3.10.A completa e todas as exceções."]
            } }
        ] }`;
fs.writeFileSync('constants.ts', content.replace(target, replacement));
console.log('Done');
