import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  H1,
  H2,
  H3,
  Row,
  Stack,
  Table,
  Text,
  computeDAGLayout,
  useHostTheme,
  type CanvasHostTheme,
  type DAGLayoutEdge,
} from "cursor/canvas";

type Kind = "pessoa" | "nosso" | "bling" | "decisao";

type Box = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  detail: string;
  kind: Kind;
};

type FlowNode = {
  id: string;
  title: string;
  detail: string;
  kind: Kind;
};

const B2C_NODES: FlowNode[] = [
  {
    id: "entra",
    title: "Entra no site",
    detail: "Sem conta. O catálogo público já está aberto.",
    kind: "pessoa",
  },
  {
    id: "compra",
    title: "Vê produtos e monta o carrinho",
    detail: "Preço e saldo vêm do espelho.",
    kind: "nosso",
  },
  {
    id: "conta",
    title: "Já tem conta?",
    detail: "A conta só é pedida na hora de pagar.",
    kind: "decisao",
  },
  {
    id: "login",
    title: "Entra na conta",
    detail: "Segue para frete e pagamento.",
    kind: "pessoa",
  },
  {
    id: "cadastro",
    title: "Cadastra na hora",
    detail: "Nome, contato e endereço da entrega.",
    kind: "pessoa",
  },
  {
    id: "fecha",
    title: "Frete e pagamento",
    detail: "Escolhe o envio e confirma a cobrança.",
    kind: "nosso",
  },
  {
    id: "espelho",
    title: "Pedido nasce no espelho",
    detail: "Este é o registro nosso da venda.",
    kind: "nosso",
  },
  {
    id: "bling",
    title: "Bling recebe e devolve",
    detail: "Entra o pedido. Voltam status, nota e estoque.",
    kind: "bling",
  },
  {
    id: "oxi",
    title: "OxDealer recebe o pedido",
    detail: "A logística entra no momento em que o pedido nasce no espelho.",
    kind: "bling",
  },
  {
    id: "acompanha",
    title: "Cliente acompanha",
    detail: "A loja mostra a situação que está no espelho.",
    kind: "pessoa",
  },
];

const B2C_EDGES = [
  { from: "entra", to: "compra" },
  { from: "compra", to: "conta" },
  { from: "conta", to: "login" },
  { from: "conta", to: "cadastro" },
  { from: "login", to: "fecha" },
  { from: "cadastro", to: "fecha" },
  { from: "fecha", to: "espelho" },
  { from: "espelho", to: "bling" },
  { from: "espelho", to: "oxi" },
  { from: "bling", to: "acompanha" },
];

const B2B_NODES: FlowNode[] = [
  {
    id: "pede",
    title: "Empresa pede acesso",
    detail: "O cadastro pode nascer no site ou no backoffice.",
    kind: "pessoa",
  },
  {
    id: "visao",
    title: "Backoffice monta a visão",
    detail: "Define uniformes, itens de empresa e o preço dela.",
    kind: "nosso",
  },
  {
    id: "aprova",
    title: "Acesso aprovado?",
    detail: "Sem aprovação, o catálogo restrito continua fechado.",
    kind: "decisao",
  },
  {
    id: "fechado",
    title: "Vê só o catálogo público",
    detail: "Uniforme e preço de empresa ficam ocultos.",
    kind: "pessoa",
  },
  {
    id: "login",
    title: "Entra com a conta aprovada",
    detail: "O login libera a visão daquela empresa.",
    kind: "pessoa",
  },
  {
    id: "catalogo",
    title: "Vê itens e preços B2B",
    detail: "Uniformes e condições que o backoffice liberou.",
    kind: "nosso",
  },
  {
    id: "fecha",
    title: "Carrinho, frete e pagamento",
    detail: "A conta já existe. O preço é o da empresa.",
    kind: "nosso",
  },
  {
    id: "espelho",
    title: "Pedido nasce no espelho",
    detail: "Guarda itens, preço B2B e o cliente da empresa.",
    kind: "nosso",
  },
  {
    id: "bling",
    title: "Bling recebe e devolve",
    detail: "Entra o pedido. Voltam status, nota e estoque.",
    kind: "bling",
  },
  {
    id: "oxi",
    title: "OxDealer recebe o pedido",
    detail: "A mesma logística da compra B2C, no nascimento do pedido.",
    kind: "bling",
  },
];

const B2B_EDGES = [
  { from: "pede", to: "visao" },
  { from: "visao", to: "aprova" },
  { from: "aprova", to: "fechado" },
  { from: "aprova", to: "login" },
  { from: "login", to: "catalogo" },
  { from: "catalogo", to: "fecha" },
  { from: "fecha", to: "espelho" },
  { from: "espelho", to: "bling" },
  { from: "espelho", to: "oxi" },
];

const PRODUTO_NODES: FlowNode[] = [
  {
    id: "bling",
    title: "Produto ou estoque muda no Bling",
    detail: "Inclusão, saldo, SKU ou EAN.",
    kind: "bling",
  },
  {
    id: "integracao",
    title: "A integração traz a mudança",
    detail: "O espelho busca ou recebe a atualização.",
    kind: "nosso",
  },
  {
    id: "espelho",
    title: "O espelho grava a cópia",
    detail: "Produto, código e saldo ficam no nosso registro.",
    kind: "nosso",
  },
  {
    id: "tela",
    title: "Loja, portais e dashboard leem o espelho",
    detail: "A tela mostra essa cópia, sem abrir o Bling.",
    kind: "nosso",
  },
];

const PRODUTO_EDGES = [
  { from: "bling", to: "integracao" },
  { from: "integracao", to: "espelho" },
  { from: "espelho", to: "tela" },
];

const PEDIDO_NODES: FlowNode[] = [
  {
    id: "loja",
    title: "A compra fecha na loja",
    detail: "B2C ou B2B, depois de frete e pagamento.",
    kind: "pessoa",
  },
  {
    id: "espelho",
    title: "O pedido nasce no espelho",
    detail: "Histórico, cliente, itens e valor.",
    kind: "nosso",
  },
  {
    id: "bling",
    title: "O espelho envia o pedido ao Bling",
    detail: "O Bling segue com a venda e a parte fiscal.",
    kind: "bling",
  },
  {
    id: "oxi",
    title: "O espelho envia o pedido à OxDealer",
    detail: "A logística recebe a entrega junto com o nascimento do pedido.",
    kind: "bling",
  },
  {
    id: "volta",
    title: "Status e estoque voltam",
    detail: "O espelho alinha a situação com o Bling.",
    kind: "bling",
  },
  {
    id: "tela",
    title: "Loja e backoffice mostram o pedido",
    detail: "Cliente e time veem a mesma situação.",
    kind: "nosso",
  },
];

const PEDIDO_EDGES = [
  { from: "loja", to: "espelho" },
  { from: "espelho", to: "bling" },
  { from: "espelho", to: "oxi" },
  { from: "bling", to: "volta" },
  { from: "volta", to: "tela" },
];

const AJUSTE_NODES: FlowNode[] = [
  {
    id: "op",
    title: "Operador age no backoffice",
    detail: "Estoque, pedido, cliente, frete ou configuração.",
    kind: "pessoa",
  },
  {
    id: "espelho",
    title: "A mudança grava no espelho",
    detail: "O espelho é o registro da operação.",
    kind: "nosso",
  },
  {
    id: "precisa",
    title: "O Bling precisa receber?",
    detail: "Depende do tipo de dado.",
    kind: "decisao",
  },
  {
    id: "bling",
    title: "Segue para o Bling",
    detail: "Pedido, estoque oficial e cliente da compra.",
    kind: "bling",
  },
  {
    id: "fica",
    title: "Fica só no espelho",
    detail: "Cargo, afiliados, preço B2B e visão do cliente.",
    kind: "nosso",
  },
];

const AJUSTE_EDGES = [
  { from: "op", to: "espelho" },
  { from: "espelho", to: "precisa" },
  { from: "precisa", to: "bling" },
  { from: "precisa", to: "fica" },
];

const BACK_NODES: FlowNode[] = [
  {
    id: "login",
    title: "Pessoa entra por SSO",
    detail: "Usa a conta corporativa para abrir o backoffice.",
    kind: "pessoa",
  },
  {
    id: "cargo",
    title: "O cargo abre os módulos",
    detail: "Dashboards, afiliados, lista de clientes, estoque, pedidos, frete e pagamento.",
    kind: "nosso",
  },
  {
    id: "age",
    title: "Consulta ou altera",
    detail: "A tela lê e grava no espelho.",
    kind: "nosso",
  },
  {
    id: "espelho",
    title: "Espelho registra a ação",
    detail: "É daqui que saem os dashboards.",
    kind: "nosso",
  },
  {
    id: "bling",
    title: "O que é venda ou estoque segue ao Bling",
    detail: "Para o saldo oficial e o pedido de venda baterem.",
    kind: "bling",
  },
  {
    id: "fica",
    title: "Regra nossa permanece no espelho",
    detail: "Cargos, afiliados, preços de empresa e a visão de cada cliente.",
    kind: "nosso",
  },
];

const BACK_EDGES = [
  { from: "login", to: "cargo" },
  { from: "cargo", to: "age" },
  { from: "age", to: "espelho" },
  { from: "espelho", to: "bling" },
  { from: "espelho", to: "fica" },
];

const AFILIADO_NODES: FlowNode[] = [
  {
    id: "entra",
    title: "Entra no portal do afiliado",
    detail: "Acesso próprio. Não usa a loja nem o SSO do time.",
    kind: "pessoa",
  },
  {
    id: "dash",
    title: "Vê os dashboards dele",
    detail: "Só os números da própria atuação.",
    kind: "nosso",
  },
  {
    id: "engaja",
    title: "Vê o engajamento",
    detail: "O que esse afiliado gerou na plataforma.",
    kind: "nosso",
  },
  {
    id: "espelho",
    title: "Os dados saem do espelho",
    detail: "O time segue controlando afiliados pelo backoffice.",
    kind: "nosso",
  },
];

const AFILIADO_EDGES = [
  { from: "entra", to: "dash" },
  { from: "dash", to: "engaja" },
  { from: "engaja", to: "espelho" },
];

const FORNECEDOR_NODES: FlowNode[] = [
  {
    id: "entra",
    title: "Entra no portal do fornecedor",
    detail: "Acesso próprio. Não usa a loja nem o SSO do time.",
    kind: "pessoa",
  },
  {
    id: "cadastra",
    title: "Cadastra produtos",
    detail: "Inclui o item dele dentro da plataforma.",
    kind: "nosso",
  },
  {
    id: "espelho",
    title: "O espelho grava o produto",
    detail: "A cópia fica no nosso registro.",
    kind: "nosso",
  },
  {
    id: "bling",
    title: "O produto segue ao Bling",
    detail: "O cadastro oficial continua por lá.",
    kind: "bling",
  },
  {
    id: "vendas",
    title: "Vê as vendas dele",
    detail: "Lidas do espelho, só as vendas dos produtos desse fornecedor.",
    kind: "nosso",
  },
];

const FORNECEDOR_EDGES = [
  { from: "entra", to: "cadastra" },
  { from: "entra", to: "vendas" },
  { from: "cadastra", to: "espelho" },
  { from: "espelho", to: "bling" },
];

function kindPaint(kind: Kind, theme: CanvasHostTheme) {
  if (kind === "bling") {
    return {
      fill: theme.fill.tertiary,
      stroke: theme.stroke.primary,
      width: 1,
      dash: undefined as string | undefined,
    };
  }
  if (kind === "decisao") {
    return {
      fill: theme.fill.secondary,
      stroke: theme.accent.primary,
      width: 1.5,
      dash: "4 3",
    };
  }
  if (kind === "nosso") {
    return {
      fill: theme.fill.secondary,
      stroke: theme.accent.primary,
      width: 1.5,
      dash: undefined,
    };
  }
  return {
    fill: theme.bg.elevated,
    stroke: theme.stroke.primary,
    width: 1,
    dash: undefined,
  };
}

function wrapLine(value: string, maxChars: number): string[] {
  const words = value.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function BoxNode({ box }: { box: Box }) {
  const theme = useHostTheme();
  const paint = kindPaint(box.kind, theme);
  const titleLines = wrapLine(box.title, Math.max(12, Math.floor((box.w - 24) / 7.4)));
  const detailLines = wrapLine(box.detail, Math.max(16, Math.floor((box.w - 24) / 6.2)));
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={6}
        fill={paint.fill}
        stroke={paint.stroke}
        strokeWidth={paint.width}
        strokeDasharray={paint.dash}
      />
      <text x={box.x + 12} y={box.y + 22} fill={theme.text.primary} fontSize={13} fontWeight={600}>
        {titleLines.map((line, index) => (
          <tspan key={line} x={box.x + 12} dy={index === 0 ? 0 : 16}>
            {line}
          </tspan>
        ))}
      </text>
      <text x={box.x + 12} y={box.y + 26 + titleLines.length * 16} fill={theme.text.secondary} fontSize={11}>
        {detailLines.map((line, index) => (
          <tspan key={line} x={box.x + 12} dy={index === 0 ? 0 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function arrowMarker(id: string, color: string) {
  return (
    <marker id={id} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill={color} />
    </marker>
  );
}

function MapaGeral() {
  const theme = useHostTheme();
  const boxes: Box[] = [
    {
      id: "b2c",
      x: 16,
      y: 12,
      w: 220,
      h: 96,
      kind: "pessoa",
      title: "B2C · site aberto",
      detail: "Navega e monta o carrinho sem conta. Cadastra só na hora de pagar.",
    },
    {
      id: "b2b",
      x: 250,
      y: 12,
      w: 220,
      h: 96,
      kind: "pessoa",
      title: "B2B · empresa",
      detail: "Cadastro aprovado para ver uniforme, item de empresa e preço.",
    },
    {
      id: "time",
      x: 484,
      y: 12,
      w: 220,
      h: 96,
      kind: "pessoa",
      title: "Time interno",
      detail: "Entra por SSO. O cargo define dashboards, afiliados, clientes e o restante.",
    },
    {
      id: "loja",
      x: 16,
      y: 164,
      w: 454,
      h: 96,
      kind: "nosso",
      title: "Loja",
      detail: "Produtos, carrinho, pedidos e login de quem compra.",
    },
    {
      id: "back",
      x: 484,
      y: 164,
      w: 220,
      h: 96,
      kind: "nosso",
      title: "Backoffice",
      detail: "Acesso por SSO. Dashboards, afiliados, lista de clientes e os demais módulos.",
    },
    {
      id: "espelho",
      x: 80,
      y: 316,
      w: 560,
      h: 84,
      kind: "nosso",
      title: "Espelho",
      detail: "Cópia nossa de produto, estoque, pedido e cliente. O pedido nasce aqui e segue ao Bling e à OxDealer.",
    },
    {
      id: "bling",
      x: 80,
      y: 456,
      w: 268,
      h: 88,
      kind: "bling",
      title: "Bling",
      detail: "Produto, estoque oficial, pedido de venda e fiscal.",
    },
    {
      id: "oxi",
      x: 372,
      y: 456,
      w: 268,
      h: 88,
      kind: "bling",
      title: "OxDealer",
      detail: "Logística. Recebe o pedido assim que ele nasce no espelho.",
    },
  ];
  const byId = Object.fromEntries(boxes.map((box) => [box.id, box]));
  const drop = (fromId: string, toId: string, x: number) => {
    const from = byId[fromId];
    const to = byId[toId];
    return `M ${x} ${from.y + from.h + 2} L ${x} ${to.y - 2}`;
  };
  const arrows = [
    drop("b2c", "loja", 126),
    drop("b2b", "loja", 360),
    drop("time", "back", 594),
    drop("loja", "espelho", 243),
    drop("back", "espelho", 594),
  ];
  const color = theme.text.tertiary;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={720} height={560} viewBox="0 0 720 560" role="img">
        <title>Mapa da loja, do backoffice, do espelho, do Bling e da OxDealer</title>
        <defs>
          {arrowMarker("mapa-seta", color)}
          <marker id="mapa-seta-inicio" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto">
            <path d="M8,0 L0,4 L8,8 Z" fill={color} />
          </marker>
        </defs>
        {arrows.map((d) => (
          <path key={d} d={d} fill="none" stroke={color} strokeWidth={1.25} markerEnd="url(#mapa-seta)" />
        ))}
        <line
          x1={214}
          y1={byId.espelho.y + byId.espelho.h + 4}
          x2={214}
          y2={byId.bling.y - 4}
          stroke={color}
          strokeWidth={1.25}
          markerStart="url(#mapa-seta-inicio)"
          markerEnd="url(#mapa-seta)"
        />
        <text x={224} y={(byId.espelho.y + byId.espelho.h + byId.bling.y) / 2 + 4} fill={theme.text.tertiary} fontSize={11}>
          ida e volta
        </text>
        <line
          x1={506}
          y1={byId.espelho.y + byId.espelho.h + 4}
          x2={506}
          y2={byId.oxi.y - 4}
          stroke={color}
          strokeWidth={1.25}
          markerEnd="url(#mapa-seta)"
        />
        <text x={516} y={(byId.espelho.y + byId.espelho.h + byId.oxi.y) / 2 + 4} fill={theme.text.tertiary} fontSize={11}>
          envia o pedido
        </text>
        {boxes.map((box) => (
          <g key={box.id}>
            <BoxNode box={box} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function MapaPortais() {
  const theme = useHostTheme();
  const boxes: Box[] = [
    {
      id: "afiliado",
      x: 16,
      y: 8,
      w: 330,
      h: 96,
      kind: "pessoa",
      title: "Afiliado",
      detail: "Entra no portal próprio. Não usa a loja nem o SSO.",
    },
    {
      id: "fornecedor",
      x: 374,
      y: 8,
      w: 330,
      h: 96,
      kind: "pessoa",
      title: "Fornecedor",
      detail: "Entra no portal próprio. Não usa a loja nem o SSO.",
    },
    {
      id: "portalA",
      x: 16,
      y: 148,
      w: 330,
      h: 88,
      kind: "nosso",
      title: "Portal do afiliado",
      detail: "Dashboards dele e o engajamento na plataforma.",
    },
    {
      id: "portalF",
      x: 374,
      y: 148,
      w: 330,
      h: 88,
      kind: "nosso",
      title: "Portal do fornecedor",
      detail: "Cadastra produtos e acompanha as vendas dele.",
    },
    {
      id: "espelho",
      x: 80,
      y: 280,
      w: 560,
      h: 80,
      kind: "nosso",
      title: "O mesmo espelho",
      detail: "Engajamento e vendas saem daqui. O produto do fornecedor segue ao Bling.",
    },
  ];
  const byId = Object.fromEntries(boxes.map((box) => [box.id, box]));
  const drop = (fromId: string, toId: string, x: number) => {
    const from = byId[fromId];
    const to = byId[toId];
    return `M ${x} ${from.y + from.h + 2} L ${x} ${to.y - 2}`;
  };
  const color = theme.text.tertiary;
  const arrows = [
    drop("afiliado", "portalA", 181),
    drop("fornecedor", "portalF", 539),
    drop("portalA", "espelho", 181),
    drop("portalF", "espelho", 539),
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={720} height={376} viewBox="0 0 720 376" role="img">
        <title>Portais do afiliado e do fornecedor</title>
        <defs>{arrowMarker("mapa-portais", color)}</defs>
        {arrows.map((d) => (
          <path key={d} d={d} fill="none" stroke={color} strokeWidth={1.25} markerEnd="url(#mapa-portais)" />
        ))}
        {boxes.map((box) => (
          <g key={box.id}>
            <BoxNode box={box} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function edgePath(edge: DAGLayoutEdge) {
  if (Math.abs(edge.sourceX - edge.targetX) < 1) {
    return `M ${edge.sourceX} ${edge.sourceY} L ${edge.targetX} ${edge.targetY}`;
  }
  const midY = (edge.sourceY + edge.targetY) / 2;
  return `M ${edge.sourceX} ${edge.sourceY} L ${edge.sourceX} ${midY} L ${edge.targetX} ${midY} L ${edge.targetX} ${edge.targetY}`;
}

function FlowChart({
  nodes,
  edges,
  nodeWidth,
  markerId,
}: {
  nodes: FlowNode[];
  edges: Array<{ from: string; to: string }>;
  nodeWidth: number;
  markerId: string;
}) {
  const theme = useHostTheme();
  const nodeHeight = 104;
  const layout = computeDAGLayout({
    nodes: nodes.map((node) => ({ id: node.id })),
    edges,
    direction: "vertical",
    nodeWidth,
    nodeHeight,
    rankGap: 36,
    nodeGap: 24,
    padding: 4,
  });
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} role="img">
        <title>Fluxo do processo</title>
        <defs>{arrowMarker(markerId, theme.text.tertiary)}</defs>
        {layout.edges.map((edge) => (
          <path
            key={`${edge.from}-${edge.to}`}
            d={edgePath(edge)}
            fill="none"
            stroke={theme.text.tertiary}
            strokeWidth={1.25}
            strokeDasharray={edge.isBackEdge ? "4 3" : undefined}
            markerEnd={`url(#${markerId})`}
          />
        ))}
        {layout.nodes.map((node) => {
          const meta = byId[node.id];
          if (!meta) return null;
          const paint = kindPaint(meta.kind, theme);
          const titleLines = wrapLine(meta.title, Math.max(12, Math.floor((nodeWidth - 24) / 7.4)));
          const detailLines = wrapLine(meta.detail, Math.max(16, Math.floor((nodeWidth - 24) / 6.2)));
          return (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={nodeWidth}
                height={nodeHeight}
                rx={6}
                fill={paint.fill}
                stroke={paint.stroke}
                strokeWidth={paint.width}
                strokeDasharray={paint.dash}
              />
              <text x={node.x + 12} y={node.y + 22} fill={theme.text.primary} fontSize={13} fontWeight={600}>
                {titleLines.map((line, index) => (
                  <tspan key={line} x={node.x + 12} dy={index === 0 ? 0 : 16}>
                    {line}
                  </tspan>
                ))}
              </text>
              <text x={node.x + 12} y={node.y + 26 + titleLines.length * 16} fill={theme.text.secondary} fontSize={11}>
                {detailLines.map((line, index) => (
                  <tspan key={line} x={node.x + 12} dy={index === 0 ? 0 : 14}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Legenda() {
  const theme = useHostTheme();
  const itens = [
    { label: "Pessoa", kind: "pessoa" as const },
    { label: "Loja, portais e espelho", kind: "nosso" as const },
    { label: "Decisão", kind: "decisao" as const },
    { label: "Bling e OxDealer", kind: "bling" as const },
  ];
  return (
    <Row gap={16} align="center" wrap>
      {itens.map((item) => {
        const paint = kindPaint(item.kind, theme);
        return (
          <div key={item.label}>
            <Row gap={6} align="center">
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: paint.fill,
                  border: `${paint.width}px ${paint.dash ? "dashed" : "solid"} ${paint.stroke}`,
                }}
              />
              <Text size="small" tone="secondary">
                {item.label}
              </Text>
            </Row>
          </div>
        );
      })}
    </Row>
  );
}

function QuadroRegistros() {
  return (
    <Card>
      <CardHeader>O que fica no espelho e o que fica no Bling</CardHeader>
      <CardBody style={{ padding: 0 }}>
        <Table
          headers={["Registro", "Espelho nosso", "Bling nesta fase"]}
          columnAlign={["left", "left", "left"]}
          rows={[
            ["Produto, SKU e EAN", "Cópia para a loja e o dashboard", "Cadastro oficial"],
            ["Estoque", "Saldo que a tela mostra", "Saldo oficial"],
            ["Pedido de venda", "Nasce na compra e guarda o histórico", "Bling recebe a venda. OxDealer recebe a logística."],
            ["Nota e parte fiscal", "Guarda o status que voltou", "Emissão e rotina fiscal"],
            ["Cliente B2C", "Conta criada na hora de pagar", "Recebe o cliente junto com o pedido"],
            ["Cliente B2B, preço e visão", "Quem vê uniforme e qual preço", "Recebe o pedido já com esse preço"],
            ["Acesso por SSO e cargos", "Conta corporativa e o que cada pessoa abre", "Fica no nosso acesso"],
            ["Afiliados", "O time controla no backoffice. O afiliado entra noutro portal.", "Fica no espelho"],
            ["Fornecedor", "Cadastra produto no portal próprio e vê as vendas dele", "O produto segue ao Bling"],
            ["Frete e pagamento", "Regra e resultado da compra", "O pedido chega com esses dados"],
          ]}
        />
      </CardBody>
    </Card>
  );
}

export default function GavioesStyleFluxos() {
  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Fluxos da Gaviões Style</H1>
        <Text tone="secondary">
          Loja para quem compra, backoffice por SSO para o time, e portais próprios para afiliado e fornecedor. O espelho é a cópia nossa dos dados. O Bling segue em produto, estoque oficial, pedido de venda e fiscal. A OxDealer recebe o pedido para a logística.
        </Text>
      </Stack>
      <Legenda />

      <Divider />
      <Stack gap={12}>
        <H2>1. Visão geral</H2>
        <Text tone="secondary">
          Quem compra entra pela loja. O time entra no backoffice por SSO. Afiliado e fornecedor entram em portais separados. Todos usam o espelho. O pedido segue ao Bling e à OxDealer.
        </Text>
        <MapaGeral />
        <H3>Acessos separados</H3>
        <Text tone="secondary" size="small">
          Afiliado e fornecedor não passam pelo e-commerce nem pelo SSO.
        </Text>
        <MapaPortais />
        <QuadroRegistros />
      </Stack>

      <Divider />
      <Stack gap={12}>
        <H2>2. Compra B2C</H2>
        <Text tone="secondary">
          Qualquer pessoa vê o catálogo público e monta o carrinho sem conta. O cadastro aparece só na hora de pagar. O pedido nasce no espelho e já segue para o Bling e para a OxDealer, a logística.
        </Text>
        <FlowChart nodes={B2C_NODES} edges={B2C_EDGES} nodeWidth={300} markerId="seta-b2c" />
      </Stack>

      <Divider />
      <Stack gap={12}>
        <H2>3. Acesso B2B</H2>
        <Text tone="secondary">
          Uniforme, item de empresa e preço fechado dependem de cadastro aprovado. O backoffice monta o que cada empresa vê e por qual preço. O catálogo público continua aberto. Quando a compra fecha, o pedido também nasce no espelho e segue para o Bling e para a OxDealer.
        </Text>
        <FlowChart nodes={B2B_NODES} edges={B2B_EDGES} nodeWidth={300} markerId="seta-b2b" />
        <Callout tone="neutral" title="Etapa seguinte">
          O pagamento direto do franqueado ao fornecedor, combinado na reunião de setembro, fica fora deste checkout.
        </Callout>
      </Stack>

      <Divider />
      <Stack gap={20}>
        <H2>4. Espelho do Bling</H2>
        <Text tone="secondary">
          Três caminhos. O espelho fica no meio: o Bling alimenta produto e estoque, a loja cria o pedido, e o backoffice opera em cima da cópia.
        </Text>
        <Stack gap={8}>
          <H3>Produto e estoque</H3>
          <Text tone="secondary" size="small">
            O produto e o saldo oficial nascem no Bling. A loja e o dashboard leem a cópia.
          </Text>
          <FlowChart nodes={PRODUTO_NODES} edges={PRODUTO_EDGES} nodeWidth={420} markerId="seta-produto" />
        </Stack>
        <Stack gap={8}>
          <H3>Pedido da loja</H3>
          <Text tone="secondary" size="small">
            A venda nasce na loja e fica no espelho. O Bling recebe a venda. A OxDealer recebe a entrega. O status volta ao espelho.
          </Text>
          <FlowChart nodes={PEDIDO_NODES} edges={PEDIDO_EDGES} nodeWidth={300} markerId="seta-pedido" />
        </Stack>
        <Stack gap={8}>
          <H3>Ajuste no backoffice</H3>
          <Text tone="secondary" size="small">
            Pedido, estoque oficial e cliente da compra seguem ao Bling. Cargo, afiliados, preço de empresa e visão do cliente ficam no espelho.
          </Text>
          <FlowChart nodes={AJUSTE_NODES} edges={AJUSTE_EDGES} nodeWidth={300} markerId="seta-ajuste" />
        </Stack>
      </Stack>

      <Divider />
      <Stack gap={12}>
        <H2>5. Backoffice</H2>
        <Text tone="secondary">
          O time entra por SSO, com a conta corporativa. O cargo abre os dashboards, o controle de afiliados, a lista de clientes e os demais módulos. O afiliado e o fornecedor não entram por aqui.
        </Text>
        <FlowChart nodes={BACK_NODES} edges={BACK_EDGES} nodeWidth={300} markerId="seta-back" />
        <Card>
          <CardHeader>Módulos do backoffice</CardHeader>
          <CardBody style={{ padding: 0 }}>
            <Table
              headers={["Módulo", "O que a pessoa faz"]}
              rows={[
                ["Dashboards", "Painéis de estoque, vendas e operação, lidos do espelho"],
                ["Controle de afiliados", "O time acompanha quem indica. O afiliado vê os números dele noutro portal."],
                ["Lista de clientes", "Vê, cadastra e aprova clientes e empresas B2B"],
                ["Visão do cliente", "Escolhe itens e preços que cada empresa vê"],
                ["Estoque", "Consulta o saldo e registra ajuste"],
                ["Pedidos de venda", "Acompanha e trata o pedido"],
                ["Frete", "Configura o envio usado na loja"],
                ["Pagamentos", "Configura os meios e acompanha a cobrança"],
                ["Cargos", "Define, depois do SSO, quais módulos cada pessoa abre"],
              ]}
            />
          </CardBody>
        </Card>
      </Stack>

      <Divider />
      <Stack gap={16}>
        <H2>6. Portais do afiliado e do fornecedor</H2>
        <Text tone="secondary">
          Dois acessos separados. Nenhum dos dois entra pelo e-commerce nem pelo SSO do backoffice.
        </Text>
        <H3>Afiliado</H3>
        <Text tone="secondary" size="small">
          Vê os dashboards e o engajamento da própria atuação. Os números saem do espelho.
        </Text>
        <FlowChart nodes={AFILIADO_NODES} edges={AFILIADO_EDGES} nodeWidth={420} markerId="seta-afiliado" />
        <H3>Fornecedor</H3>
        <Text tone="secondary" size="small">
          Cadastra produtos na plataforma e acompanha as vendas dele. O produto fica no espelho e segue ao Bling.
        </Text>
        <FlowChart nodes={FORNECEDOR_NODES} edges={FORNECEDOR_EDGES} nodeWidth={300} markerId="seta-fornecedor" />
      </Stack>
    </Stack>
  );
}
