const puppeteer = require("puppeteer");
const fs = require('fs');
const readline = require('readline');

console.log("Bot de WhatsApp criado por Clayton Del Tedesco Júnior!");
console.log("Utilziado para enviar automaticamente mensagens para uma lista de números.\n");

const phoneNumbersFile = '/phone_numbers.txt'; // Provide the path to the file with phone numbers
const message_file = '/Message.txt'; //carrega a mensagem a ser enviada
const path = __dirname + `${message_file}`;
const filePath = __dirname + `${phoneNumbersFile}`;
// Telefone que iniciará o processo de envio
var phone = [];

//função para delay de abertura de página
function delay(time){
    return new Promise(function (resolve){
        setTimeout(resolve,time);
    });
};

//fução que carrega os números de telefone do arquivo phone_numbers.txt
function readPhoneNumbersFromFile(filePath) {
    const phoneNumbers = [];
    const fileStream = fs.createReadStream(filePath);
  
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
  
    rl.on('line', (line) => {
      const phoneNumber = line.trim();
      if (phoneNumber) {
        phoneNumbers.push(phoneNumber);
      }
    });
  
    return new Promise((resolve) => {
      rl.on('close', () => {
        resolve(phoneNumbers);
      });
    });
  }

//carrega o arquivo texto com a mensagem
var text = fs.readFileSync(path, 'utf-8');

var missing = 0; //variável auxiliar para contar os números que não foram possíveis o envio
var index = -2; //variável auxliar para contar os números que foram possíveis o envio

async function robot() {
    const browser = await puppeteer.launch( {headless: false}); //abre o browser
    const page = await browser.newPage(); //abre uma nova página

    
    const phoneNumbers = await readPhoneNumbersFromFile(filePath);
    phone[0] = phoneNumbers[0]

    //faz a primiera interação fora do for, por precisar de autenticação da página do WhatsApp
    await page.goto('https://web.whatsapp.com/send?phone=+'+phone[0]+'&text='+text+'');
    console.log("Enviando mensagem para: ",phone[0]);
    await delay(30000); //delay para logar no WhatsApp --> Atualize esse valor para um maior no caso do programa não estiver funcionando corretamente

    //Verifica se é possível enviar a mensagem
    if (await page.$("span[data-testid='send']") !== null){
        await page.click("span[data-testid='send']"); //clica no botão para enviar a mensagem
        await delay(8000); //Atualize esse valor para um maior no caso do programa não estiver funcionando corretamente
        index++;
    }
    //Se não conseguir enviar, avista o usuário no terminal que o número não foi encontrado
    else{
        console.log("Número:", phone[0], "não encontrado!\n\nAtualise os tempos de delay para um número maior!\n");
        await browser.close();
        return;
    }

    for (const phoneNumber of phoneNumbers) {
        await page.goto('https://web.whatsapp.com/send?phone=+'+phoneNumber+'&text='+text+'');
        console.log("Enviando mensagem para: ", phoneNumber);
        await delay(12000); //Atualize esse valor para um maior no caso do programa não estiver funcionando corretamente
        //Verifica se é possível enviar a mensagem
        if (await page.$("span[data-testid='send']") !== null){
            await page.click("span[data-testid='send']");
            await delay(8000); //Atualize esse valor para um maior no caso do programa não estiver funcionando corretamente
            index++;
        }
        //Se não conseguir enviar, avista o usuário no terminal que o número não foi encontrado
        else{
            console.log("Número:", phoneNumber, "não encontrado!");
            missing++;
        }
    }
    
    console.log("\nParabéns, você enviou para: ",(index), "números!!!\n");
    console.log("\nUm total de: ", (missing), "números não foram enviados.\n")
    await browser.close();
};
robot(); 