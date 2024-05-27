var database = require("../database/config")

function cadastrarEndereco(logradouro,cep,numero,complemento,cidade,estado,nomeFantasia,razaoSocial,cnpj,matriz){
    var instrucaoSelect = `
        insert into endereco (logradouro,cep,numero,complemento,cidade,uf) values 
        ("${logradouro}","${cep}","${numero}","${complemento}","${cidade}","${estado}")
    ` 
    console.log("Executando a instrucao SQL (insert): \n "+instrucaoSelect);

    return database.executar(instrucaoSelect)
        .then(function (enderecoResultado) {
            var enderecoId = enderecoResultado.insertId;
            cadastrar(nomeFantasia,razaoSocial,cnpj,matriz,enderecoId)
        })
}


function cadastrar(nomeFantasia,razaoSocial,cnpj,matriz,enderecoId){
    console.log("ACESSEI O EMPRESA MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ")
    var instrucao = `
    insert into empresa (nome_fantasia,razao_social,cnpj,fk_matriz,fk_endereco) values 
    ("${nomeFantasia}","${razaoSocial}","${cnpj}",${matriz},${enderecoId});
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function buscarMatriz(){
    var instrucao = `
        select nome_fantasia,id_empresa from empresa where fk_matriz is null;
    `
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function buscarFiliais(id_empresa){
    var instrucao =  `
        select * from  empresa where fk_matriz = ${id_empresa} or id_empresa = ${id_empresa};
    `
    console.log("executando instrucao sql: "+instrucao)
    return database.executar(instrucao)
}

function  buscarFunc(id_empresa){
    var instrucao = `
        select * from funcionario where fk_empresa = ${id_empresa};
    `
    console.log(`Executando a instrucao sql: ${instrucao}`)
    return database.executar(instrucao)
}

function buscarConfigAtual(id_empresa){
    var instrucao = `
    select DATE_FORMAT(fim,'%d-%m-%Y %H:%i') as fim,DATE_FORMAT(inicio,'%d-%m-%Y %H:%i') as inicio,max_cpu,max_ram,max_volume,sensibilidade_mouse,timer_mouse_ms,intervalo_volume_ms,intervalo_registro_ms,id_quest,intervalo_quest_dias from config join agendamento_quest on id_config = fk_config where id_config = ${id_empresa};
`
console.log(`Executando a instrucao sql: ${instrucao}`)
return database.executar(instrucao)
}

function atualizarConfigAtualRegistro(id_empresa,ram,cpu,int){
    var instrucao = `
    update config set max_ram = ${ram}, max_cpu = ${cpu}, intervalo_registro_ms = ${int} where id_config = ${id_empresa};
`
console.log(`Executando a instrucao sql: ${instrucao}`)
return database.executar(instrucao)
}

function atualizarConfigAtualVolume(id_empresa,vol,int){
    var instrucao = `
    update config set max_volume = ${vol}, intervalo_volume_ms = ${int} where id_config = ${id_empresa};
`
console.log(`Executando a instrucao sql: ${instrucao}`)
return database.executar(instrucao)
}

function buscarTarefasAtrasadas(id_empresa){
    var instrucao = `
    select count(id_tarefa) as qtdTarefas from tarefa join funcionario on fk_funcionario = id_funcionario where concluida=false and dt_fim < now() and fk_empresa = ${id_empresa} group by fk_funcionario;
    `
    console.log(`Executando a instrucao sql: ${instrucao}`)
    return database.executar(instrucao)
}

function buscarOperadoresComMaisTarefasAtrasadas(id_empresa){
    var instrucao = `
    select primeiro_nome,sobrenome,count(id_tarefa) as tarefasAtrasadas from tarefa join funcionario where fk_funcionario = id_funcionario and fk_empresa = ${id_empresa} group by fk_funcionario ORDER BY tarefasAtrasadas DESC limit 3;
    `
    console.log(`Executando a instrucao sql: ${instrucao}`)
    return database.executar(instrucao)
}

function buscarSatisfacaoOperadores(id_empresa){
    var instrucao = `
    select ROUND((sum(nota)/count(nota)),2) as media from questionario as q join funcionario as f on fk_funcionario = id_funcionario where f.fk_empresa = ${id_empresa};
    `
    console.log(`Executando a instrucao sql: ${instrucao}`)
    return database.executar(instrucao)
}

function cadastrarFeedback(dtInicio, dtFim, idEmpresa){
    var instrucao = `
    insert into agendamento_quest (inicio, fim, fk_config) values ('${dtInicio}','${dtFim}',${idEmpresa});
    `
    console.log(`Executando a instrucao sql: ${instrucao}`)
    return database.executar(instrucao)
}

function buscarTempoNoUltimoPeriodo(periodo, idGerente, ordem) {
    var instrucao = `
    select primeiro_nome, sobrenome, fk_usuario, sum(tempo_registro_ms) tempo, count(h.id_historico_tarefa) tarefa from tempo_ociosidade join usuario on fk_usuario = id_usuario join funcionario on id_usuario = id_funcionario join tarefa t on t.fk_funcionario = id_funcionario join historico_tarefa h on id_tarefa = fk_tarefa where dt_hora_registro >= '${periodo}' and status='ATRASO' and t.fk_gerente = ${idGerente} group by fk_usuario order by ${ordem} desc;
    `
    console.log(`Executando a instrucao sql: ${instrucao}`)
    return database.executar(instrucao)
}

module.exports = {
    cadastrarEndereco,
    cadastrar,
    buscarMatriz,
    buscarFiliais,
    buscarFunc,
    buscarConfigAtual,
    atualizarConfigAtualRegistro,
    atualizarConfigAtualVolume,
    buscarTarefasAtrasadas,
    buscarOperadoresComMaisTarefasAtrasadas,
    buscarSatisfacaoOperadores,
    cadastrarFeedback,
    buscarTempoNoUltimoPeriodo
};