import xml.etree.ElementTree as ET

xml_data = '''<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe" xmlns:ns2="http://www.w3.org/2000/09/xmldsig#">
    <infNFe Id="NFe1234567890123456789012345678901234567890" versao="4.00">
        <ide>
            <cUF>35</cUF>
            <cNF>12345678</cNF>
            <natOp>Venda de Mercadoria</natOp>
            <mod>55</mod>
            <serie>1</serie>
            <nNF>123</nNF>
            <dhEmi>2023-08-06T12:00:00-03:00</dhEmi>
            <tpNF>1</tpNF>
            <idDest>1</idDest>
            <cMunFG>3550308</cMunFG>
            <tpImp>1</tpImp>
            <tpEmis>1</tpEmis>
            <cDV>0</cDV>
            <tpAmb>2</tpAmb>
            <finNFe>1</finNFe>
            <indFinal>1</indFinal>
            <indPres>9</indPres>
            <procEmi>0</procEmi>
            <verProc>1.0</verProc>
        </ide>
        <emit>
            <CNPJ>12345678901234</CNPJ>
            <xNome>Empresa Emitente</xNome>
            <xFant>Empresa</xFant>
            <enderEmit>
                <xLgr>Rua do Comércio</xLgr>
                <nro>123</nro>
                <xBairro>Centro</xBairro>
                <cMun>3550308</cMun>
                <xMun>São Paulo</xMun>
                <UF>SP</UF>
                <CEP>01010000</CEP>
                <cPais>1058</cPais>
                <xPais>Brasil</xPais>
            </enderEmit>
            <IE>1234567890</IE>
            <CRT>3</CRT>
        </emit>
        <dest>
            <CNPJ>12345678901234</CNPJ>
            <xNome>Empresa Destinatária</xNome>
            <enderDest>
                <xLgr>Rua da Indústria</xLgr>
                <nro>456</nro>
                <xBairro>Industrial</xBairro>
                <cMun>3550308</cMun>
                <xMun>São Paulo</xMun>
                <UF>SP</UF>
                <CEP>02020000</CEP>
                <cPais>1058</cPais>
                <xPais>Brasil</xPais>
            </enderDest>
            <IE>1234567890</IE>
        </dest>
        <det nItem="1">
            <prod>
                <cProd>123</cProd>
                <cEAN>7891234567890</cEAN>
                <xProd>Produto Teste</xProd>
                <NCM>22011000</NCM>
                <CFOP>5102</CFOP>
                <uCom>UN</uCom>
                <qCom>10.00</qCom>
                <vUnCom>5.00</vUnCom>
                <vProd>50.00</vProd>
                <cEANTrib>7891234567890</cEANTrib>
                <uTrib>UN</uTrib>
                <qTrib>10.00</qTrib>
                <vUnTrib>5.00</vUnTrib>
                <indTot>1</indTot>
            </prod>
            <imposto>
                <ICMS>
                    <ICMS00>
                        <orig>0</orig>
                        <CST>00</CST>
                        <modBC>0</modBC>
                        <vBC>50.00</vBC>
                        <pICMS>18.00</pICMS>
                        <vICMS>9.00</vICMS>
                    </ICMS00>
                </ICMS>
                <PIS>
                    <PISAliq>
                        <CST>01</CST>
                        <vBC>50.00</vBC>
                        <pPIS>0.65</pPIS>
                        <vPIS>0.33</vPIS>
                    </PISAliq>
                </PIS>
                <COFINS>
                    <COFINSAliq>
                        <CST>01</CST>
                        <vBC>50.00</vBC>
                        <pCOFINS>3.00</pCOFINS>
                        <vCOFINS>1.50</vCOFINS>
                    </COFINSAliq>
                </COFINS>
            </imposto>
        </det>
        <total>
            <ICMSTot>
                <vBC>50.00</vBC>
                <vICMS>9.00</vICMS>
                <vBCST>0.00</vBCST>
                <vST>0.00</vST>
                <vProd>50.00</vProd>
                <vFrete>0.00</vFrete>
                <vSeg>0.00</vSeg>
                <vDesc>0.00</vDesc>
                <vII>0.00</vII>
                <vIPI>0.00</vIPI>
                <vPIS>0.33</vPIS>
                <vCOFINS>1.50</vCOFINS>
                <vOutro>0.00</vOutro>
                <vNF>51.83</vNF>
            </ICMSTot>
        </total>
        <transp>
            <modFrete>0</modFrete>
            <vol>
                <qVol>1</qVol>
                <esp>CAIXA</esp>
                <marca>Marca</marca>
                <nVol>12345</nVol>
                <pesoL>0.500</pesoL>
                <pesoB>0.600</pesoB>
            </vol>
        </transp>
        <infAdic>
            <infCpl>Informações adicionais sobre a nota fiscal.</infCpl>
        </infAdic>
    </infNFe>
</NFe>
'''

# Code to handle NFe structure
def extract_nfe_info(root, namespace):
    ide_info = {}
    ide = root.find(".//{%s}ide" % namespace)
    ide_info["cUF"] = ide.find("{%s}cUF" % namespace).text
    ide_info["cNF"] = ide.find("{%s}cNF" % namespace).text
    # Add more fields from the "ide" section if needed

    emit_info = {}
    emit = root.find(".//{%s}emit" % namespace)
    emit_info["CNPJ"] = emit.find("{%s}CNPJ" % namespace).text
    emit_info["xNome"] = emit.find("{%s}xNome" % namespace).text
    # Add more fields from the "emit" section if needed

    dest_info = {}
    dest = root.find(".//{%s}dest" % namespace)
    dest_info["CNPJ"] = dest.find("{%s}CNPJ" % namespace).text
    dest_info["xNome"] = dest.find("{%s}xNome" % namespace).text
    # Add more fields from the "dest" section if needed

    produtos = []
    for det in root.findall(".//{%s}det" % namespace):
        produto = {}
        produto["cProd"] = det.find(".//{%s}cProd" % namespace).text
        produto["xProd"] = det.find(".//{%s}xProd" % namespace).text
        produto["qCom"] = det.find(".//{%s}qCom" % namespace).text
        produto["vUnCom"] = det.find(".//{%s}vUnCom" % namespace).text
        produto["vProd"] = det.find(".//{%s}vProd" % namespace).text
        produtos.append(produto)

    total_info = {}
    total = root.find(".//{%s}total" % namespace)
    total_info["vBC"] = total.find(".//{%s}vBC" % namespace).text
    total_info["vICMS"] = total.find(".//{%s}vICMS" % namespace).text
    # Add more fields from the "total" section if needed

    transp_info = {}
    transp = root.find(".//{%s}transp" % namespace)
    transp_info["modFrete"] = transp.find(".//{%s}modFrete" % namespace).text
    # Add more fields from the "transp" section if needed

    infAdic_info = {}
    infAdic = root.find(".//{%s}infAdic" % namespace)
    infAdic_info["infCpl"] = infAdic.find(".//{%s}infCpl" % namespace).text
    # Add more fields from the "infAdic" section if needed

    print("Informações da seção ide:", ide_info)
    print("Informações da seção emit:", emit_info)
    print("Informações da seção dest:", dest_info)
    print("Informações dos produtos:")
    for produto in produtos:
        print("-" * 30)
        print("Código do Produto:", produto["cProd"])
        print("Descrição do Produto:", produto["xProd"])
        print("Quantidade:", produto["qCom"])
        print("Valor Unitário:", produto["vUnCom"])
        print("Valor Total:", produto["vProd"])
    print("Informações da seção total:", total_info)
    print("Informações da seção transp:", transp_info)
    print("Informações da seção infAdic:", infAdic_info)

# Code to handle NFse structure
def extract_nfse_info(root, namespace):
    # Modify this function to extract information from the "NFse" structure
    pass

# Check if the XML is NFe or NFse and call the appropriate function
if "NFe" in xml_data:
    root = ET.fromstring(xml_data)
    namespace = root.tag.split('}')[0][1:]
    extract_nfe_info(root, namespace)
elif "NFse" in xml_data:
    root = ET.fromstring(xml_data)
    namespace = root.tag.split('}')[0][1:]
    extract_nfse_info(root, namespace)
else:
    print("Unknown XML structure.")
