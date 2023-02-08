import './App.css'
import * as nearAPI from "near-api-js";
import {Contract, WalletConnection} from "near-api-js";
import {ChangeEvent, useEffect, useState} from "react";
import {AccountBalance} from "near-api-js/lib/account";

const CONTRACT_ADDRESS = 'homeworknear.testnet';
const COLOR_CONTRACT = 'frontend-test-3.badconfig.testnet';
const {connect, keyStores} = nearAPI;

const connectionConfig = {
    networkId: "testnet",
    keyStore: new keyStores.BrowserLocalStorageKeyStore(), // first create a key store
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
};

type colorsRGB = 'r' | 'g' | 'b'
type RGB = Record<colorsRGB, number | undefined>
type ContractExtension = Contract & { get: () => Promise<keyof RGB> } & { set: (rgb: RGB) => Promise<keyof RGB> }

function App() {
    const [wallet, setWalletConnection] = useState<WalletConnection>()
    const [balance, setBalance] = useState<AccountBalance | undefined>()
    const [accountName, setAccountName] = useState<string | undefined>()
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [colorRGB, setColorRGB] = useState<RGB>()
    const [contract, setContract] = useState<ContractExtension>();

    const getWalletConnection = async () => {
        const nearConnection = await connect(connectionConfig);
        // create wallet connection
        const walletConnection = new WalletConnection(nearConnection, 'my-app-homework');
        const isSignedIn = walletConnection.isSignedIn()

        setIsLoggedIn(isSignedIn)
        setWalletConnection(walletConnection)


        const account = walletConnection.account();

        // use a contract view method
        if (isSignedIn) {
            const methodOptions = {
                viewMethods: ['get'],
                changeMethods: ['set']
            };

            const contractColor = new Contract(
                account,
                COLOR_CONTRACT,
                methodOptions
            ) as ContractExtension

            setContract(contractColor)
            const colors = await contractColor.get()
            setColorRGB({r: +colors[0], g: +colors[1], b: +colors[2]})
            console.log('color', colors)
        }

        setBalance(await account.getAccountBalance())
        setAccountName(walletConnection?.getAccountId())
    }

    useEffect(() => {
        getWalletConnection()
    }, [])

    const signIn = async () => {
        !isLoggedIn && wallet?.requestSignIn({
            contractId: COLOR_CONTRACT,
        });
    }

    const signOut = () => {
        console.log('signOut')
        wallet?.signOut();
        setIsLoggedIn(false)
    }

    const submit = async () => {
        // use a contract view method
        if (isLoggedIn && colorRGB) {
            await contract?.set(colorRGB).then(async v => {
                const colors = await contract.get()
                setColorRGB({r: +colors[0], g: +colors[1], b: +colors[2]})
            })
        }
    }

    return (
        <div className="App">
            <h1 style={{ 'color': `rgba(${colorRGB?.r || 0}, ${colorRGB?.b || 0}, ${colorRGB?.g || 0}, 1)`}}>
                {isLoggedIn ? "You are logged in" : "You are not logged in"}
            </h1>
            <div>
                balance: {!balance ? 'loading...' : <pre>{JSON.stringify(balance)}</pre>}
            </div>
            <div>
                accountName: {!accountName ? 'loading...' : <pre>{JSON.stringify(accountName)}</pre>}
            </div>
            <div className="card">
                {
                    isLoggedIn ? <button onClick={() => signOut()}>
                        signOut Wallet
                    </button> : <button onClick={() => signIn()}>
                        signIn Wallet
                    </button>
                }
            </div>
            {isLoggedIn ? <>
                <div className="card">
                    <input name='r' type="number" min={0} max={255} value={colorRGB?.r}
                           onChange={(event: ChangeEvent<HTMLInputElement>) => {
                               colorRGB && setColorRGB({...colorRGB, r: Number(event?.target?.value)})
                           }
                           }/>
                    <input name='g' type="number" min={0} max={255} value={colorRGB?.g}
                           onChange={(event: ChangeEvent<HTMLInputElement>) => {
                               colorRGB && setColorRGB({...colorRGB, g: Number(event.target.value)})
                           }
                           }/>
                    <input name='b' type="number" min={0} max={255} value={colorRGB?.b}
                           onChange={(event: ChangeEvent<HTMLInputElement>) => {
                               colorRGB && setColorRGB({...colorRGB, b: Number(event.target.value)})
                           }}/>
                </div>
                <button type='button' onClick={submit}>Fetch new data</button>
            </> : <></>}

        </div>
    )
}

export default App
