const inquirer = require("inquirer");
const chalk = require("chalk");

const fs = require("fs");
const { create } = require("domain");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que deseja fazer?",
        choices: [
          "Criar Conta",
          "Verificar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];

      if (action === "Criar Conta") {
        createAccount();
      } else if (action === "Verificar Saldo"){
        getAccountBalance()
      } else if (action === "Depositar"){
        deposit()
      } else if (action === "Sacar"){
        withdraw()
      } else if (action === "Sair"){ 
        console.log(chalk.bgBlue.black('Obrigado por usar nosso banco.'))
        process.exit()
      }
    })
    .catch((err) => console.log(err));
}

// criação de conta

function createAccount() {
  console.log(chalk.bgGreen.black("Obrigado por escolher nosso banco"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));
  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      console.info(accountName)

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Essa conta já existe, escolha outra nome")
        );
        buildAccount();
        return
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance":0}',
        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.green('Parabens, sua conta foi criada com sucesso!'))
      operation()

     
    })
    .catch((err) => console.log(err));
}


// adicionar valor no saldo.

function deposit(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da conta que deseja depositar?'
    }])
    .then((answer) => {
        const accountName = answer['accountName']

  //verificar se a conta existe
        if(!checkAccount(accountName)){
            return deposit()
        }
        inquirer.prompt([{
          name: 'amount',
          message: 'Quanto você deseja depositar?'
        }])
        .then( (answer) =>{
          const amount = answer['amount']
          addAmount(accountName, amount)
          operation()
        }
          
        )
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

//verificar se a conta existe  

function checkAccount(accountName){
   if (!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed('Conta não existe, tente novamente !'))
        return false
    }
    return true
}


// adicionar saldo

function addAmount(accountName, amount){
  const accountData = getAccount(accountName)

  if(!amount){
    console.log(chalk.bgRed("Ocorreu um erro, tente mais tarde."))
    return deposit()
  }
  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), err => console.log(err))

  console.log(chalk.green(`Foi depositado o valor de R$${amount}`))
}



function getAccount(accountName){
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf-8',
    flag: 'r'
  })  
  return JSON.parse(accountJSON)
}


// mostrando saldo da conta
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName']

      //verificar se a conta existe
      if (!checkAccount(accountName)) {
        return getAccountBalance()
      }

      const accountData = getAccount(accountName)

      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta é de R$${accountData.balance}`,
        ),
      )
      operation()
    })
}


// sacar o valor da conta

function withdraw(){
  inquirer.prompt([{
    name: 'accountName',
    message: 'Qual o nome da sua conta?'
  }])
  .then((answer) =>{
    const accountName  = answer['accountName']

    if(!checkAccount(accountName)){
      return withdraw()
    }

    //remover o valor
    inquirer.prompt([{
      name: 'amount',
      message: 'Qual o valor que deseja sacar?'
    }])
    .then((answer) => {
      const amount = answer['amount']
      removeAmount(accountName, amount)
    })
    .catch(err => console.log(err))
  })
  .catch(err => console.log(err))
}


function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'),
    )
    return withdraw()
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponível!'))
    return withdraw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    },
  )

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`),
  )
}
function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'),
    )
    return withdraw()
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponível!'))
    return withdraw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    },
  )

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`),
  )
  operation()
}