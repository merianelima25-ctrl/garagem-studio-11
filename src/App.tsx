import { useState, useEffect } from "react";

type Aluno = {
  id: number;
  nome: string;
  telefone: string;
  valor: number;
  vencimento: string;
  pago: boolean;
};

export default function App() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");

  useEffect(() => {
    const dados = localStorage.getItem("alunos");
    if (dados) setAlunos(JSON.parse(dados));
  }, []);

  useEffect(() => {
    localStorage.setItem("alunos", JSON.stringify(alunos));
  }, [alunos]);

  function adicionarAluno() {
    if (!nome || !valor || !vencimento) return;

    const novo: Aluno = {
      id: Date.now(),
      nome,
      telefone,
      valor: Number(valor),
      vencimento,
      pago: false,
    };

    setAlunos([...alunos, novo]);
    setNome("");
    setTelefone("");
    setValor("");
    setVencimento("");
  }

  function togglePagamento(id: number) {
    setAlunos(
      alunos.map((a) =>
        a.id === id ? { ...a, pago: !a.pago } : a
      )
    );
  }

  function removerAluno(id: number) {
    setAlunos(alunos.filter((a) => a.id !== id));
  }

  function gerarWhatsApp(aluno: Aluno) {
    const msg = `Olá ${aluno.nome}, sua mensalidade de R$${aluno.valor} venceu em ${aluno.vencimento}. Favor regularizar.`;
    const url = `https://wa.me/55${aluno.telefone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  const totalRecebido = alunos
    .filter((a) => a.pago)
    .reduce((acc, a) => acc + a.valor, 0);

  const totalAtrasado = alunos
    .filter((a) => !a.pago)
    .reduce((acc, a) => acc + a.valor, 0);

  function atrasado(aluno: Aluno) {
    const hoje = new Date();
    const venc = new Date(aluno.vencimento);
    return !aluno.pago && venc < hoje;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🏋️ Gestão de Academia</h1>

      <div style={{ marginBottom: 20 }}>
        <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input placeholder="Telefone (DDD+Número)" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <input placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} />
        <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} />

        <button onClick={adicionarAluno}>Adicionar</button>
      </div>

      <h3>💰 Total Recebido: R$ {totalRecebido}</h3>
      <h3>⚠️ Em Atraso: R$ {totalAtrasado}</h3>

      <ul>
        {alunos.map((a) => (
          <li key={a.id} style={{
            marginBottom: 10,
            color: a.pago ? "green" : atrasado(a) ? "red" : "black"
          }}>
            <strong>{a.nome}</strong> - R${a.valor}  
            | Venc: {a.vencimento}

            <button onClick={() => togglePagamento(a.id)}>
              {a.pago ? "Pago" : "Marcar pago"}
            </button>

            <button onClick={() => removerAluno(a.id)}>Excluir</button>

            {!a.pago && (
              <button onClick={() => gerarWhatsApp(a)}>
                Cobrar WhatsApp
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
