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
          "Transferir",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];

      if (action === "Criar Conta") {
        createAccount();
      } else if (action === "Verificar Saldo") {
        getAccountBalance();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Sacar") {
        withdraw();
      } else if (action === "Transferir") {
        transferAmount();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar nosso banco."));
        process.exit();
      } else if (action === "Sacar") {
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

      console.info(accountName);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Essa conta já existe, escolha outra nome")
        );
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance":0}',
        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.green("Parabens, sua conta foi criada com sucesso!"));
      operation();
    })
    .catch((err) => console.log(err));
}

// adicionar valor no saldo.

function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da conta que deseja depositar?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      //verificar se a conta existe
      if (!checkAccount(accountName)) {
        return deposit();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          addAmount(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

//verificar se a conta existe

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed("Conta não existe, tente novamente !"));
    return false;
  }
  return true;
}

// adicionar saldo

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed("Ocorreu um erro, tente mais tarde."));
    return deposit();
  }
  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => console.log(err)
  );

  console.log(chalk.green(`Foi depositado o valor de R$${amount}`));
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf-8",
    flag: "r",
  });
  return JSON.parse(accountJSON);
}

// mostrando saldo da conta
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      //verificar se a conta existe
      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta é de R$${accountData.balance}`
        )
      );
      operation();
    });
}

// sacar o valor da conta

function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return withdraw();
      }

      //remover o valor
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Qual o valor que deseja sacar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          removeAmount(accountName, amount);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponível!"));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`)
  );
}
function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponível!"));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`)
  );
  operation();
}

function transferAmount() {
  inquirer
    .prompt([
      {
        name: "fromAccount",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const fromAccount = answer["fromAccount"];

      if (!checkAccount(fromAccount)) {
        return transferAmount();
      }

        inquirer.prompt([{
          name: 'toAccount',
          message: 'Qual nome da conta para qual deseja transferi-la?'
        }])
        .then((answer) => {
          const toAccount = answer["toAccount"];

          if (!checkAccount(toAccount)) {
            return transferAmount();
          }

          if (fromAccount === toAccount) {
            console.log(chalk.bgRed("Não é possível transferir para a mesma conta!"));
            return transferAmount();
          }

          inquirer
          .prompt([
            {
              name: "amount",
              message: "Quanto você deseja transferir?",
              validate: (value) => {
                const valid = !isNaN(value) && Number(value) > 0;
                return valid || "Digite um valor válido!";
              },
            },
          ])
          .then((answer) => {
            const amount = answer["amount"];
            const accountData = getAccount(fromAccount);
            const receiverData = getAccount(toAccount);
  
            if (!amount) {
              console.log(
                chalk.bgRed.white("Ocorreu um erro, tente novamente mais tarde!")
              );
              return transferAmount();
            } 

            if( accountData.balance < amount){
              console.log(chalk.bgRed("Saldo insuficiente!"));
              return transferAmount();
            }

            accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
            receiverData.balance = parseFloat(receiverData.balance) + parseFloat(amount)

            saveAccount(fromAccount, accountData);
              saveAccount(toAccount, receiverData);

            console.log(
              chalk.green(`Transferência realizada com sucesso!`)
            );
            operation();
          })
          
          .catch((err) => console.log(err));
        })
        .catch(err => console.log(err))
    });
}

function saveAccount(accountName, data) {
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(data),
    (err) => console.log(err)
  );
}