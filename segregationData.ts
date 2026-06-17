import { DGRDatabase } from './types';

export const SEGREGATION_DATABASE_DATA = [
  {
    key: "1",
    class_a: "Classe 1 - Explosivos",
    class_b: "Classe 4.2 - Combustão Espontânea",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A / Seção 9.3",
    latam_rules: "Regra LATAM JJ-01: Proibido embarque simultâneo no mesmo ULD ou posição adjacente.",
    anac_rules: "ANAC RBAC 175: Exigência técnica de segregação total sob supervisão de Operador de Carga.",
    exceptions_details: "O aquecimento espontâneo da Classe 4.2 pode desencadear detonação em cadeia catastrófica de explosivos."
  },
  {
    key: "2",
    class_a: "Classe 1 - Explosivos",
    class_b: "Classe 5.2 - Peróxidos Orgânicos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "LATAM Var: Segregação absoluta e isolamento termo-regulador para peróxidos.",
    anac_rules: "ANAC RBAC 175.115: Segregação obrigatória e rígida em terminais de carga brasileiros.",
    exceptions_details: "Peróxidos orgânicos são instáveis e geram liberação violenta de oxigênio sob decomposição, acelerada por atrito ou explosão."
  },
  {
    key: "3",
    class_a: "Classe 1 - Explosivos",
    class_b: "Classe 7 - Radioativos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR 9.3.A / CNEN NE-5.01",
    latam_rules: "Diretriz de Segurança Latam: Requer aprovação estrita do comitê corporativo de segurança de carga.",
    anac_rules: "ANAC & CNEN: Afastamento geométrico obrigatório para evitar contaminação por radiação e risco secundário de incêndio.",
    exceptions_details: "A radiação emitida pela Classe 7 pode perturbar compostos químicos voláteis em certos detonadores."
  },
  {
    key: "4",
    class_a: "Classe 2.1 - Gás Inflamável",
    class_b: "Classe 4.2 - Combustão Espontânea",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Instrução LATAM: Afastamento de pelo menos um compartimento de carga físico ou 3m de distância.",
    anac_rules: "RBAC 175: Proibitivo no mesmo pallet de fretamento internacional.",
    exceptions_details: "A elevação de temperatura devido à combustão espontânea da Classe 4.2 causa sobrepressão exponencial e explosão em cilindros de gás de Classe 2.1."
  },
  {
    key: "5",
    class_a: "Classe 2.1 - Gás Inflamável",
    class_b: "Classe 5.1 - Oxidantes",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Procedimento Operacional LATAM: Segregação de 1.5 metros ou separação por cortina divisora em hangar.",
    anac_rules: "Instrução ANAC: Classificação prioritária para combate de vazamentos em voo.",
    exceptions_details: "Agentes oxidantes liberam oxigênio diatômico, transformando pequenos vazamentos de gás inflamável em um maçarico contínuo insolúvel."
  },
  {
    key: "6",
    class_a: "Classe 2.1 - Gás Inflamável",
    class_b: "Classe 5.2 - Peróxidos Orgânicos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Regra de Carga Especial LATAM: Não compartilhar convés se operado em aeronaves mistas.",
    anac_rules: "RBAC 175: Segregar no armazenamento e manuseio aeroportuário.",
    exceptions_details: "Ruptura térmica e violenta liberação combustível gasosa."
  },
  {
    key: "7",
    class_a: "Classe 2.1 - Gás Inflamável",
    class_b: "Classe 7 - Radioativos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Regra LATAM: Manter afastamento correspondente ao TI acumulado.",
    anac_rules: "Diretriz CNEN/ANAC: Segregação de Classe 7 para áreas de gases inflamáveis armazenados sob pressão.",
    exceptions_details: "A radiação ionizante pode catalisar degradação e desgaste físico prematuro das válvulas reguladoras de bronze."
  },
  {
    key: "8",
    class_a: "Classe 2.2 - Gás Não-Inflamável",
    class_b: "Classe 4.2 - Combustão Espontânea",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Instrução LATAM: Não carregar adjacente a cilindros criogênicos de LAr ou N2 líquido.",
    anac_rules: "RBAC 175: Segregar de todas as substâncias que experimentam ignição ao contato com o ar residual.",
    exceptions_details: "Embora os gases da classe 2.2 não sofram ignição direta, a alta temperatura de reações da classe 4.2 provoca rompimento e sobrepressão violenta mecânica nos vasos cilíndricos."
  },
  {
    key: "9",
    class_a: "Classe 2.2 - Gás Não-Inflamável",
    class_b: "Classe 5.2 - Peróxidos Orgânicos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Companhia LATAM: Carregar peróxidos apenas em compartimentos estanques separados.",
    anac_rules: "RBAC 175: Manter afastados de materiais sob perigo de oxigenação auto-acelerada.",
    exceptions_details: "Os peróxidos orgânicos reagem de forma extremamente rápida e de liberação exotérmica que causa dilatação e vazamento de gás asfixiante ou oxidante."
  },
  {
    key: "10",
    class_a: "Classe 2.2 - Gás Não-Inflamável",
    class_b: "Classe 7 - Radioativos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Manual LATAM: Segregação de blindagem padrão exigida para Classe 7.",
    anac_rules: "RBAC 175: Obedecer regras de fator TI.",
    exceptions_details: "Radiação excessiva altera propriedades moleculares de polímeros das vedações lubrificadas dos cilindros de gás sob pressão extrema."
  },
  {
    key: "11",
    class_a: "Classe 2.3 - Gás Tóxico",
    class_b: "Classe 4.2 - Combustão Espontânea",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Restrição JJ-14: Severas restrições aéreas para trânsito de gases altamente tóxicos em voos domésticos.",
    anac_rules: "RBAC 175: Proibitivo embarcar adjacente a cargas pirofóricas sólidas ou líquidas.",
    exceptions_details: "O fogo pirofórico espontâneo da Classe 4.2 pode derreter cilindros ou sistemas de vedação da Classe 2.3, provocando dispersão instantânea atmosférica de gases tóxicos letais na cabine de voo."
  },
  {
    key: "12",
    class_a: "Classe 2.3 - Gás Tóxico",
    class_b: "Classe 5.2 - Peróxidos Orgânicos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Regra LATAM: Segregar em compartimentos de carga frontal e traseiro independentes.",
    anac_rules: "RBAC 175: Segregar obrigatoriamente para conter risco de intoxicação acidental.",
    exceptions_details: "Peróxidos catalisam processos degradativos corrosivos que rompem materiais ferrosos e facilitam vazamento de frações tóxicas nocivas em compartimento selado de carga."
  },
  {
    key: "13",
    class_a: "Classe 2.3 - Gás Tóxico",
    class_b: "Classe 7 - Radioativos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Procedimento LATAM: Rigor de separação estrito.",
    anac_rules: "RBAC 175: Segregação total para fins de saúde ocupacional no manuseio de pista.",
    exceptions_details: "Isotópicos e radioativos devem ter distância protetiva geométrica padrão para evitar reações secundárias de vazamento combinado e intoxicação radiológica residual."
  },
  {
    key: "14",
    class_a: "Classe 3 - Líquidos Inflamáveis",
    class_b: "Classe 4.2 - Combustão Espontânea",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Regra LATAM LA-03 / JJ-04: Proibido o carregamento no mesmo ULD metálico aberto.",
    anac_rules: "RBAC 175: Exigência nacional de barreira física ou distância horizontal mínima de 3 metros em hangares.",
    exceptions_details: "A inflamação e combustão exposta da Classe 4.2 atua como ignição imediata para qualquer vapor volatilizado ou vazamento de Líquido Classe 3."
  },
  {
    key: "15",
    class_a: "Classe 3 - Líquidos Inflamáveis",
    class_b: "Classe 5.1 - Oxidantes",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Restrição LATAM: Segregar por pelo menos uma posição completa de palete principal.",
    anac_rules: "ANAC Carga Segura: Segregar totalmente em armazéns de retenção.",
    exceptions_details: "Misturas de agentes oxidantes com líquidos orgânicos inflamáveis formam propulsores químicos explosivos extremamente perigosos e instáveis."
  },
  {
    key: "16",
    class_a: "Classe 3 - Líquidos Inflamáveis",
    class_b: "Classe 5.2 - Peróxidos Orgânicos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Disposição LATAM LA-14: Classificado como carga refrigerada de alto monitoramento. Proibido proximidade ou contato.",
    anac_rules: "RBAC 175: Requisitos estritos de separação física absoluta de todas as demais classes perigosas inflamáveis.",
    exceptions_details: "Os peróxidos orgânicos sob estresse de calor causam autoignição espontânea violenta e alimentam o incêndio de solventes aromáticos Classe 3."
  },
  {
    key: "17",
    class_a: "Classe 3 - Líquidos Inflamáveis",
    class_b: "Classe 7 - Radioativos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Regra LATAM: Afastamentos medidos por instrumento ou distâncias geométricas mínimas de projeto em convés.",
    anac_rules: "Diretrizes Integradas CNEN / ANAC: Manter distância mínima regulamentar e segregar em zonas distintas.",
    exceptions_details: "Materiais radioativos representam ameaça combinada em eventos de incêndios por explosão de solventes Classe 3 devido à dispersão radioativa."
  },
  {
    key: "18",
    class_a: "Classe 4.1 - Sólido Inflamável",
    class_b: "Classe 4.2 - Combustão Espontânea",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Restrição Geral LATAM: Proibido pallet compartilhado e manuseio próximo na rampa.",
    anac_rules: "RBAC 175: Segregar obrigatoriamente nos compartimentos e armazéns aeroportuários.",
    exceptions_details: "A queima interna sem chamas expostas da Classe 4.2 atua como calor de fricção contínuo ativando ignição brusca de pós do grupo 4.1."
  },
  {
    key: "19",
    class_a: "Classe 4.1 - Sólido Inflamável",
    class_b: "Classe 5.1 - Oxidantes",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "LATAM Var: Segregar por pelo menos 1,5m em rampa ou colocar em ULDs fechados independentes.",
    anac_rules: "ANAC RBAC 175: Segregação absoluta e combate primário prioritário.",
    exceptions_details: "Sólidos inflamáveis finamente divididos (como enxofre em pó) inflamam instantaneamente e de forma explosiva em contato microscópico com cristais de oxidantes."
  },
  {
    key: "20",
    class_a: "Classe 4.1 - Sólido Inflamável",
    class_b: "Classe 5.2 - Peróxidos Orgânicos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "LATAM Procedimento: Proibido carregar na mesma aeronave de passageiros mesmo que as quantidades individuais sejam mitigadas.",
    anac_rules: "RBAC 175: Manter afastamento geométrico rígido.",
    exceptions_details: "Combustão vigorosa catalisada sem necessidade de oxigênio gasoso ambiente."
  },
  {
    key: "21",
    class_a: "Classe 4.1 - Sólido Inflamável",
    class_b: "Classe 7 - Radioativos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Diretrizes Operacionais LATAM: Atender de forma cumulativa limites do TI.",
    anac_rules: "CNEN & ANAC: Segregação obrigatória estrita por limites calculados.",
    exceptions_details: "Radiação ionizante e fumaça corrosiva/perigosa de incêndio em sólidos formam resíduos dispersivos radioativos de risco operacional severo."
  },
  {
    key: "22",
    class_a: "Classe 4.2 - Combustão Espontânea",
    class_b: "Classe 4.3 - Perigo com Água",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Fretamentos Especiais LATAM: Cargas classificadas sob restrição máxima de carregamento.",
    anac_rules: "RBAC 175: Segregação padrão obrigatória nas importações/exportações de cargas químicas.",
    exceptions_details: "Calor pirofórico da Classe 4.2 causa ignição fulminante em gases hidrogênio ou acetileno gerados caso a Classe 4.3 entre em contato com qualquer umidade."
  },
  {
    key: "23",
    class_a: "Classe 4.2 - Combustão Espontânea",
    class_b: "Classe 5.1 - Oxidantes",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "LATAM Var: Manter segregação de compartimento físico rígida de alta especificidade.",
    anac_rules: "ANAC RBAC 175: Segregar obrigatoriamente.",
    exceptions_details: "Pirofóricos ou autoinflamáveis reagem de forma espontânea extremamente violenta e acelerada em atmosferas enriquecidas com oxigênio livre liberado por oxidantes."
  },
  {
    key: "24",
    class_a: "Classe 4.2 - Combustão Espontânea",
    class_b: "Classe 5.2 - Peróxidos Orgânicos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Guia Corporativo LATAM: Carga crítica de alto risco de explosão térmica. Requer ULD com ar-condicionado independente se aplicável.",
    anac_rules: "RBAC 175: Segregar de forma irreversível.",
    exceptions_details: "Calor espontâneo da Classe 4.2 causa auto-decomposição e posterior explosão física autotérmica nos recipientes de peróxidos orgânicos."
  },
  {
    key: "25",
    class_a: "Classe 4.2 - Combustão Espontânea",
    class_b: "Classe 6.1 - Tóxicos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Regra LATAM: Manter afastamento para carregamento terrestre no pátio aeroportuário.",
    anac_rules: "ANAC: Atenção redobrada para resguardo de alimentos e rações.",
    exceptions_details: "Em caso de fogo espontâneo Classe 4.2 sobre produtos Classe 6.1, são gerados pirolisados e vapores altamente tóxicos letais por via inalatória."
  },
  {
    key: "26",
    class_a: "Classe 4.2 - Combustão Espontânea",
    class_b: "Classe 8 - Corrosivos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "LATAM Var: Isolar corrosivos e autoinflamáveis em extremidades opostas do convés principal.",
    anac_rules: "ANAC RBAC 175: Segregação recomendada.",
    exceptions_details: "Vazamentos de ácidos degradam envoltórios metálicos pirofóricos promovendo exposição direta repentina ao oxigênio do ar e inflamação imediata."
  },
  {
    key: "27",
    class_a: "Classe 4.3 - Perigo com Água",
    class_b: "Classe 5.2 - Peróxidos Orgânicos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Disposição Especial LATAM: Isolar e carregar apenas em posições de drenagem seca.",
    anac_rules: "ANAC RBAC 175: Segregação absoluta exigida em pátio nacional de trânsito.",
    exceptions_details: "Muitos peróxidos orgânicos são formulados como emulsões ou soluções contendo traços de água livre. O vazamento sobre a Classe 4.3 gera reações violentas de grande desprendimento térmico."
  },
  {
    key: "28",
    class_a: "Classe 4.3 - Perigo com Água",
    class_b: "Classe 8 - Corrosivos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Instrução LATAM: Não compartilhar ULD. Corrosivos alcalinos e ácidos devem ficar longe.",
    anac_rules: "ANAC RBAC 175.115: Segregar obrigatoriamente para resguardar as superfícies da fuselagem contra gases inflamáveis e corrosão severa combinada.",
    exceptions_details: "Líquidos corrosivos (frequentemente contendo bases aquosas) ao contato direto com a Classe 4.3 iniciam uma reação química instantânea, gerando hidrogênio altamente perigoso."
  },
  {
    key: "29",
    class_a: "Classe 5.1 - Oxidantes",
    class_b: "Classe 5.2 - Peróxidos Orgânicos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "LATAM Procedimento Interno: Segregar rigorosamente, manter isolamento térmico ideal.",
    anac_rules: "ANAC: Exigência nacional de barreira física ou distância mínima de separação.",
    exceptions_details: "A mistura de peróxidos orgânicos instáveis com oxidante forte acarreta um aumento extremo e descontrolado da taxa combustiva, progredindo rapidamente para explosão térmica severa."
  },
  {
    key: "30",
    class_a: "Classe 5.1 - Oxidantes",
    class_b: "Classe 8 - Corrosivos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "LATAM Regulação: Segregação física estrita. Palete independente compulsório.",
    anac_rules: "ANAC RBAC 175.72: Ácidos inorgânicos na presença de oxidantes sofrem reações agressivas oxidativas gerando fumaça nitrosa letal.",
    exceptions_details: "A corrosão química promovida sobre embalagens oxidantes derrete embalagens protetivas, gerando ignição de materiais orgânicos vizinhos."
  },
  {
    key: "31",
    class_a: "Classe 5.2 - Peróxidos Orgânicos",
    class_b: "Classe 8 - Corrosivos",
    status: "SIM (Segregação Necessária)",
    reference: "Manual IATA DGR Tabela 9.3.A",
    latam_rules: "Diretrizes de Manuseio LATAM: Segregação compulsória para conter risco a fuselagens.",
    anac_rules: "RBAC 175: Segregação total para fins de saúde ocupacional no manuseio de rampa.",
    exceptions_details: "Corrosivos liquefazem os invólucros dos peróxidos orgânicos, gerando instabilidade térmica imediata e subsequente risco de detonação térmica secundária."
  },
  {
    key: "32",
    class_a: "Classe 9 / UN 3480 (Baterias de Lítio)",
    class_b: "Classe 1 - Explosivos",
    status: "SIM (Mandatário IATA)",
    reference: "IATA DGR Seção 9.3 • Addendum 1 Mandatário",
    latam_rules: "Restrição Corporativa LATAM: Baterias UN 3480 Sec IA/IB jamais devem ser carregadas na mesma aeronave cargueira adjacente a explosivos Classe 1.",
    anac_rules: "ANAC RBAC 175: Rigidez na verificação e segregação de baterias de Lítio e sub-riscos associados.",
    exceptions_details: "Um evento catastrófico de fuga térmica (thermal runaway) na bateria de lítio funciona como um pavio térmico incontrolável em alta temperatura que detona explosivos Classe 1."
  },
  {
    key: "33",
    class_a: "Classe 9 / UN 3480 (Baterias de Lítio)",
    class_b: "Classe 3 - Líquidos Inflamáveis",
    status: "SIM (Mandatário IATA)",
    reference: "IATA DGR Seção 9.3 • Addendum 1 Mandatário",
    latam_rules: "Regra LATAM: Carregamento exclusivo em compartimentos estanques com supressão de fogo classe D/Halon ativo.",
    anac_rules: "ANAC Instrução Suplementar IS 175-001: Exigência operacional nacional de embalagem antichama certificada.",
    exceptions_details: "O calor gerado por baterias de lítio em curto (fuga térmica) pode superar 600°C instantaneamente, provocando vaporização violenta e ignição generalizada de líquidos inflamáveis vizinhos."
  },
  {
    key: "34",
    class_a: "Classe 9 / UN 3480 (Baterias de Lítio)",
    class_b: "Classe 5.1 - Oxidantes",
    status: "SIM (Mandatário IATA)",
    reference: "IATA DGR Seção 9.3 • Addendum 1 Mandatário",
    latam_rules: "Procedimento Interno LATAM Cargo: Não colocar baterias de lítio em pallets com peróxidos ou oxidantes industriais.",
    anac_rules: "ANAC RBAC 175: Segregar preventivamente de agentes comburentes químicos.",
    exceptions_details: "Oxidantes e peróxidos alimentam o fogo em baterias de lítio com oxigênio puro, tornando o vazamento ou incêndio de bateria virtualmente inextinguível por agentes convencionais."
  }
];

export const SEGREGATION_DATABASE: DGRDatabase = {
  id: "segregation-table-db",
  title: "Tabela 9.3.A - Requisitos de Segregação Completa",
  type: "variations", // Reuses the browser friendly multi-column component
  columns: [
    { key: "class_a", label: "Classe de Risco A", width: "w-44", filterable: true },
    { key: "class_b", label: "Classe de Risco B", width: "w-44", filterable: true },
    { key: "status", label: "Status de Segregação", width: "w-48", filterable: true },
    { key: "reference", label: "Ref. IATA DGR", width: "w-36", filterable: true },
    { key: "latam_rules", label: "Procedimento LATAM (JJ/LA)", width: "w-64", filterable: true },
    { key: "anac_rules", label: "Exigências ANAC (RBAC 175)", width: "w-64", filterable: true },
    { key: "exceptions_details", label: "Detalhes do Conflito e Prevenção", width: "flex-1", filterable: true }
  ],
  data: SEGREGATION_DATABASE_DATA
};
