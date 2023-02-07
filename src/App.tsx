import './App.css'
import * as nearAPI from "near-api-js";
import {WalletConnection} from "near-api-js";
import {useEffect, useState} from "react";
import {AccountBalance} from "near-api-js/lib/account";

const CONTRACT_ADDRESS = 'homeworknear.testnet';
const {connect, keyStores} = nearAPI;

function App() {
    const [walletConnection, setWalletConnection] = useState<WalletConnection>()
    const [balance, setBalance] = useState<AccountBalance | undefined>()
    const [accountName, setAccountName] = useState<string | undefined>()
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)


    const connectionConfig = {
        networkId: "testnet",
        keyStore: new keyStores.BrowserLocalStorageKeyStore(), // first create a key store
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
    };

    const getWalletConnection = async () => {
        const nearConnection = await connect(connectionConfig);
        // create wallet connection
        const walletConnection = new WalletConnection(nearConnection, 'my-app-homework');

        setWalletConnection(walletConnection)

        // gets account balance
        const account = await walletConnection?.account();

        setBalance(await account?.getAccountBalance())
        setAccountName(walletConnection?.getAccountId())
    }

    useEffect(() => {
        getWalletConnection()
    }, [])

    useEffect(() => {
        walletConnection?.isSignedIn() ? setIsLoggedIn(true) : setIsLoggedIn(false)
    }, [walletConnection])

    const signIn = async () => {
        console.log('signIn')
        // connect to NEAR
        walletConnection?.requestSignIn({
            contractId: CONTRACT_ADDRESS,
        });
    }

    const signOut = () => {
        console.log('signOut')
        walletConnection?.signOut();
        setIsLoggedIn(false)
    }


    return (
        <div className="App">
            <h1>
                {isLoggedIn ? "you are logged in" : "you are not logged in"}
            </h1>
            <div>
                <p>balance: {!balance ? 'loading...' : <pre>{JSON.stringify(balance)}</pre>}</p>
            </div>
            <div>accountName: {!accountName ? 'loading...' : <pre>{JSON.stringify(accountName)}</pre>}</div>
            <div className="card">
                {
                    isLoggedIn ? <button onClick={() => signOut()}>
                        signOut Wallet
                    </button> : <button onClick={() => signIn()}>
                        signIn Wallet
                    </button>
                }
            </div>
        </div>
    )
}

export default App
