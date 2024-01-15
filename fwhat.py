from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.support.ui import Select
from bs4 import BeautifulSoup
import time

options = Options()
options.add_argument("/Users/depesh/Library/Application Support/Google/Chrome/Profile 4")
driver = webdriver.Chrome()
driver.get("https://web.whatsapp.com/")
try:
    while True:   
        driver.find_element("xpath",'/html/body/div[3]/div[3]/div/button' ).click() 
        driver.find_element("xpath",'/html/body/div[2]/div/div[1]/div/div/button' ).click() 
        driver.find_element("xpath",'/html/body/div[3]/div[5]/div[2]/button' ).click() 
        driver.find_element("id","loginButton").click()
except:
    try:
        driver.find_element("xpath",'/html/body/center/form/table[1]/tbody/tr[1]/td[2]/p/input').send_keys("JP1796597")
        driver.find_element("xpath",'/html/body/center/form/table[1]/tbody/tr[2]/td[2]/p/input').send_keys("ahsupm1234")
        x = input('KAAM GARYO TA 😅 ?\n')
        if x == "umm":
            try:
                driver.find_element("xpath",'/html/body/center/p/table/tbody/tr/td[1]/input' ).click() 
                time.sleep(0.5)
                driver.find_element("xpath",'/html/body/form/center/table[17]/tbody/tr[2]/td/font/input').click()
                time.sleep(0.5)
                driver.find_element("xpath",'/html/body/form/center/center/table/tbody/tr/td[3]/input').click()
                alert = Alert(driver) 
                #print(alert.text)
                alert.accept()
                driver.find_element("xpath",'/html/body/form/center/center/table/tbody/tr/td[3]/p/input').click()
                driver.find_element("xpath",'/html/body/form/center/center[2]/p/table/tbody/tr/td[3]/input').click()
                
                #selection
                select = Select(driver.find_element("id","select1"))
                select.select_by_value('F10-E10J')
                driver.find_element("id","test").click()
                select = Select(driver.find_element("name","selBYear"))
                select.select_by_value('2004')
                select = Select(driver.find_element("name","selBMonth"))
                select.select_by_value('10')
                select = Select(driver.find_element("name","selBDay"))
                select.select_by_value('29')
                driver.find_element("xpath",'/html/body/form/center/center/table/tbody/tr/td/p[1]/table/tbody/tr[2]/td[2]/input[1]').click()
                select = Select(driver.find_element("name","selNation"))
                select.select_by_value('Nepal')
                select = Select(driver.find_element("name","selLang"))
                select.select_by_value('Nepali')
                driver.find_element("xpath",'/html/body/form/center/center/table/tbody/tr/td/p[1]/table/tbody/tr[5]/td[2]/table/tbody/tr[1]/td[1]/input').click()
                select = Select(driver.find_element("name","selTraveling"))
                select.select_by_value('No, I have not been to Japan before')
                select = Select(driver.find_element("name","selStudy"))
                select.select_by_value('300 hours (Approx. 20 hours per week for 4 months')
                driver.find_element("xpath",'/html/body/form/center/center/table/tbody/tr/td/p[1]/table/tbody/tr[8]/td[2]/table/tbody/tr[1]/td[1]/input').click()
                driver.find_element("xpath",'/html/body/form/center/center/table/tbody/tr/td/p[1]/table/tbody/tr[9]/td[2]/input').send_keys("Aiwa educational consultancy")
                driver.find_element("xpath",'/html/body/form/center/center/table/tbody/tr/td/p[1]/table/tbody/tr[10]/td[2]/table/tbody/tr[2]/td[1]/input').click()
                driver.find_element("xpath",'/html/body/form/center/center/table/tbody/tr/td/p[1]/table/tbody/tr[11]/td[2]/table/tbody/tr[1]/td[1]/input').click()
                select = Select(driver.find_element("name","selStatus"))
                select.select_by_value('G')
                driver.find_element("xpath",'/html/body/form/center/p/table/tbody/tr/td[3]/input').click()
                driver.find_element("xpath",'/html/body/form/center/p/table/tbody/tr/td[3]/input').click()
                # find slot now ------>
                clearit = False
                firsttime = True
                try:
                    while not(startD == (endD+1) and startM == endM):
                        if clearit:
                            driver.find_element("xpath",'/html/body/form/center/center[1]/table/tbody/tr[2]/td[2]/font/input[1]').clear()
                            driver.find_element("xpath",'/html/body/form/center/center[1]/table/tbody/tr[2]/td[2]/font/input[2]').clear()
                            driver.find_element("xpath",'/html/body/form/center/center[1]/table/tbody/tr[2]/td[2]/font/input[3]').clear()
                        clearit = True
                        driver.find_element("xpath",'/html/body/form/center/center[1]/table/tbody/tr[2]/td[2]/font/input[1]').send_keys(str(startY))
                        driver.find_element("xpath",'/html/body/form/center/center[1]/table/tbody/tr[2]/td[2]/font/input[2]').send_keys(str(startM))
                        driver.find_element("xpath",'/html/body/form/center/center[1]/table/tbody/tr[2]/td[2]/font/input[3]').send_keys(str(startD))
                        if firsttime:
                            driver.find_element("name",'areaCode').click()
                            time.sleep(1)
                            select = Select(driver.find_element("name","countryCode"))
                            select.select_by_value(country)
                            firsttime = False
                        driver.find_element("xpath",'/html/body/form/center/center[1]/table/tbody/tr[6]/td/input').click()

                        time.sleep(2)
                        table = driver.page_source
                        
                        
                        z = table.split("\n")
                        got_it = []
                        for l in z:
                            if l.find("td bgcolor") != -1:
                                got_it.append(l)
                        finalOne = []
                        for l in got_it:
                            if l.find("width=\"45\"")  != -1:
                                finalOne.append(l)
                        Data = []
                        for d in finalOne:
                            if d.find("#FF6666") != -1:
                                Data.append("---")
                            else:
                                Data.append("OO")
                        if len(Data) == 0:
                            print(startY,startM,startD," -->  ","HOLIDAY")
                        else:
                            print(startY,startM,startD," -->  ",Data)
                        
                        if startD == endD and startM == endM:
                            break
                        
                        if startD != lastmD:
                            startD += 1
                        elif startD == lastmD:
                            startD = 1
                            startM += 1
                        
                        
                except:
                    print("problem in while")
                    while True:
                        pass
            except:
                print("some problem check please")
                while True:
                    pass
                    
        elif x == "2":
                pass
        else:
            exit()
            
            
    except:
        print("final exception of captcha")
        while True:
            pass
while True:
    pass
            
    