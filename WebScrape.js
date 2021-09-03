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
        await discord_message.edit("Logging into mat.ir...⌛")
        //login baraye mat.ir
        await driver.get("https://student.mat.ir/")
        await driver.findElement(By.id("UserName")).sendKeys(username_str)
        await driver.findElement(By.id("Password")).sendKeys(password_str)
        await driver.findElement(By.id("btnToken")).click()
        await discord_message.edit("Logged in succesfully✅")

        //tooye dashboarde mat.ir
        await discord_message.edit("Waiting for mat.ir to load up...⏳")
        await driver.wait(until.elementLocated(By.xpath('//*[@id="formKarsanj"]/button')), 15000)
        await driver.sleep(2000);
        await driver.findElement(By.xpath('//*[@id="formKarsanj"]/button')).click()
        await discord_message.edit("Clicked on karsanj button✅")

        //tooye karsanj dashboard
        await discord_message.edit("Heading to assignmet_list...⌛")
        await driver.get("https://karsanj.net/assignment_list.php")

        //tooye fehreste takalif
        await driver.wait(until.elementLocated(By.xpath('//*[@id="homework"]/div[2]/div[2]/div/label/input')), 15000) //namayeshe mashghaye ghabli
        .then(namayesheGhabliHa => namayesheGhabliHa.click())
        await discord_message.edit("Listing mashgha, almost there...⌛")

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

        await driver.findElement(By.xpath('//*[@id="homework"]/div[2]/div[1]/button[1]')).click()

        await driver.executeScript(`
        $("body > center").children(":not( table:nth-child(2))").remove()
        $("body > center > table > tbody").children(":not( tr:nth-child(1))").remove()
        $("body > center > table > tbody > tr > td > table > tbody > tr ").children(":not( td:nth-child(1))").remove()
        $("body > center > table > tbody > tr > td > table > tbody > tr > td ").children(":not( table:nth-child(3))").remove()
        $("body > center > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > div ").children(":not( div:nth-child(3))").remove()`)
        await driver.executeScript("document.body.style.zoom='130%'")
        let buffer = await driver.takeScreenshot()
        fs.writeFileSync("screenshot_set.png", buffer , "base64")
        
        return mashgha
        // console.log(mashgha)

    } catch(err){        
        console.log(err)
    }
    finally{
        driver.quit()
    }
}

async function uploadMasgha(username, password, name ,homework_text,file_name,discord_message){
    const driver = new Builder()
    .forBrowser("chrome")
    .build()

    try{
        //login baraye mat.ir
        await driver.get("https://student.mat.ir/")
        discord_message.edit("Logging in as" + name + "⌛")
        await driver.findElement(By.id("UserName")).sendKeys(username)
        await driver.findElement(By.id("Password")).sendKeys(password)
        await driver.findElement(By.id("btnToken")).click()
        await discord_message.edit("Logged in succesfully ✅")

        //tooye dashboarde mat.ir
        await discord_message.edit("Waiting for mat.ir to load up...⏳")
        await driver.wait(until.elementLocated(By.xpath('//*[@id="formKarsanj"]/button')), 15000)
        await driver.sleep(2000);
        await driver.findElement(By.xpath('//*[@id="formKarsanj"]/button')).click()
        await discord_message.edit("Clicked on karsanj button✅")

        //tooye karsanj dashboard
        await discord_message.edit(`Waiting for \n \`\`\`${homework_text}\`\`\` \n to be located`)
        await driver.get("https://karsanj.net/assignment_list.php")

        await driver.wait(until.elementLocated(By.linkText(homework_text)), 15000)
        .then(async karsanjgButton => {
            await karsanjgButton.click()
        })

        await discord_message.edit("Uploading the file...⏳")
        let file = "./mashgha/" + file_name
        await driver.findElement(By.id("myfile")).sendKeys(path.resolve(file))
 
        await driver.wait(until.elementLocated(By.xpath(`//*[text()='${file_name}']`)), 20000)

        await discord_message.edit(`Taking a screen shot , say CHEESE! ✌`)
        await driver.executeScript("document.body.style.zoom='63%'")
        let buffer = await driver.takeScreenshot()
        fs.writeFileSync("screenshot_upload.png", buffer , "base64")


        return true


    }catch(err){
        console.log(err)
        // uploadMasgha()
    }finally{
        driver.close()
    }
}
module.exports = {getMashgha , uploadMasgha}