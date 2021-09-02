const path = require("path")
const {Builder ,  By , until } = require("selenium-webdriver")
const fs = require("fs")

let username_str = "0250161893"
let password_str = "kosesina"

async function getMashgha(discord_message){
    const driver = new Builder()
    .forBrowser("chrome")
    .build()

    try{
        await discord_message.edit("loging into mat.ir...")
        //login baraye mat.ir
        await driver.get("https://student.mat.ir/")
        await driver.findElement(By.id("UserName")).sendKeys(username_str)
        await driver.findElement(By.id("Password")).sendKeys(password_str)
        await driver.findElement(By.id("btnToken")).click()
        await discord_message.edit("logged in succesfully")

        //tooye dashboarde mat.ir
        await discord_message.edit("waiting for mat.ir to load up...")
        await driver.wait(until.elementLocated(By.xpath('/html/body/div/div[2]/div[2]/div/div/div[3]/form/button')), 15000)
        .then(karsanjgButton => karsanjgButton.click())
        await discord_message.edit("clicked on karsanj button")

        //tooye karsanj dashboard
        await discord_message.edit("heading to assignmet_list...")
        await driver.get("https://karsanj.net/assignment_list.php")

        //tooye fehreste takalif
        await driver.wait(until.elementLocated(By.xpath('//*[@id="homework"]/div[2]/div[2]/div/label/input')), 15000) //namayeshe mashghaye ghabli
        .then(namayesheGhabliHa => namayesheGhabliHa.click())
        await discord_message.edit("listing mashgha, almost there...")
        await driver.executeScript("document.body.style.zoom='150%'")
        let buffer = await driver.takeScreenshot()

        let darsButtons
        await driver.wait(until.elementsLocated(By.xpath('/html/body/center/table[2]/tbody/tr[1]/td/table/tbody/tr/td[1]/table/tbody/tr/td/div/div[2]/div[1]/div[2]/div[1]/button')), 15000)
        .then(dokmeyedarsa => darsButtons = dokmeyedarsa)

        let mashgha = []
        
        for (const darsButton of darsButtons){
            await darsButton.click()
            let topic = await darsButton.getText()
            
            if(topic != "همه درس ها"){
                let mashghArr = {"topic": topic,"homework":[]}
                let mashgh_ha = await driver.findElement(By.xpath('/html/body/center/table[2]/tbody/tr[1]/td/table/tbody/tr/td[1]/table/tbody/tr/td/div/div[2]/div[1]/div[2]/div[2]/ul')).findElements(By.tagName("li"))
                for (const mashgh of mashgh_ha){
                    try{
                        if(await mashgh.findElement(By.xpath("div[1]/a/b"))){
                            let mashghText = await mashgh.findElement(By.xpath("div[1]/a/b")).getText()
                            
                            if(mashghText.replace(/\s/g,'') !== ""){
                                mashghArr.homework.push(mashghText)
                            }
                        }

                    }
                    catch{

                    }
                }
                mashgha.push(mashghArr)
            }
        }
        await discord_message.delete()

        fs.writeFileSync("screenshot.png", buffer , "base64")

        await discord_message.channel.send({ files: ["screenshot.png"] })

        
        return mashgha
        // console.log(mashgha)

    } catch(err){
        setTimeout(getMashgha , 5000)
        
        console.log(" are are " )
    }
    finally{
        driver.quit()
    }
}

async function uploadMasgha(username, password,homework_text,file_name,discord_message){
    const driver = new Builder()
    .forBrowser("chrome")
    .build()

    try{
        //login baraye mat.ir
        await driver.get("https://student.mat.ir/")
        await driver.findElement(By.id("UserName")).sendKeys(username)
        await driver.findElement(By.id("Password")).sendKeys(password)
        await driver.findElement(By.id("btnToken")).click()

        //tooye dashboarde mat.ir
        await driver.wait(until.elementLocated(By.xpath('/html/body/div/div[2]/div[2]/div/div/div[3]/form/button')), 15000)
        .then(karsanjgButton => karsanjgButton.click())

        //tooye karsanj dashboard
        await driver.get("https://karsanj.net/assignment_list.php")

        await driver.wait(until.elementLocated(By.linkText(homework_text)), 15000)
        .then(async karsanjgButton => {
            await karsanjgButton.click()
            let file = "./mashgha/" + file_name
            await driver.findElement(By.id("myfile")).sendKeys(path.resolve(file))
        })

    }catch(err){
        console.log(err)
        // uploadMasgha()
    }finally{
    }
}
module.exports = {getMashgha , uploadMasgha}