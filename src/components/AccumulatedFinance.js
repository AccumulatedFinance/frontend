import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';

import axios from 'axios';

import { Layout, Button, Badge, Modal, Typography, Timeline, Divider, Row, Col, Statistic, Collapse, Alert, Tag, Tabs, Form, Input, Descriptions, message, Tooltip, Popover } from 'antd';

import CountUp from 'react-countup';

import Web3 from 'web3';
import { useWeb3React } from "@web3-react/core";

import { InjectedConnector } from "@web3-react/injected-connector";

import { IconContext } from "react-icons";
import {
    RiHeartFill, RiFundsLine, RiDropLine, RiGiftLine, RiDropFill, RiMoneyDollarCircleFill, RiLock2Fill, RiSafe2Line, RiExternalLinkLine, RiGithubFill, RiTwitterFill, RiTelegramFill, RiMediumFill
} from 'react-icons/ri';

import Logo from './common/Logo';
import LogoToken from './common/LogoToken';
import ScrollToTop from './common/ScrollToTop';
import AccumulateAPI from './common/AccumulateAPI';

import { truncateAddress, web3BNToFloatString, toRoundedDown, decimalCount } from "./utils";
import BigNumber from 'bignumber.js'

import LiquidStakingABI from './../abi/ACMELIquidStaking.json';
import TokenABI from './../abi/WrappedToken.json';

import stACMELogo from './../stacme.svg';
import WACMELogo from './../wacme.svg';

const { Panel } = Collapse;
const { Header, Content, Footer } = Layout;
const { Text, Paragraph, Title } = Typography;
const { Countdown } = Statistic;

const AccumulatedFinance = props => {

    const deadline = 1678406399000;

    const etherscan = process.env.REACT_APP_ETHERSCAN;
    const pow = new BigNumber('10').pow(new BigNumber(8));
    const maxApproval = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

    const formatter = (value) => <CountUp end={value} duration={0.75} decimals={0} separator="," />;
    const formatterDecimals = (value) => <CountUp end={value} duration={0.75} decimals={1} separator="," />;  

    const [lsContract, setLSContract] = useState(null);
    const [wacmeContract, setWACMEContract] = useState(null);
    const [stacmeContract, setStACMEContract] = useState(null);
    const [stakingAccount, setStakingAccount] = useState(null);
    const [stakingTVL, setStakingTVL] = useState(null);
    const [acmePrice, setACMEPrice] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [wacmeBalance, setWACMEBalance] = useState(0);
    const [wacmeAmount, setWACMEAmount] = useState(0);
    const [wacmeAllowance, setWACMEAllowance] = useState(0);
    const [wacmeIsApprovingLS, setWACMEIsApprovingLS] = useState(false);
    const [wacmeFormTxHash, setWACMEFormTxHash] = useState(null);
    const [stacmeBalance, setStACMEBalance] = useState(0);
    const [stacmeAmount, setStACMEAmount] = useState(0);
    // const [stacmeallowance, setStACMEAllowance] = useState(0);  

    const injected = new InjectedConnector();

    const {
        account,
        activate,
        deactivate,
        active,
        chainId,
    } = useWeb3React();

    // ACFI modal
    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleOk = () => {
        setIsModalOpen(false);
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const connect = () => {
        if (window.ethereum) {
            activate(injected);
            window.web3 = new Web3(window.ethereum);
        } else {
            message.warning("MetaMask not found");
        }
    }

    const disconnect = () => {
        deactivate();
        refreshState();
    };

    const refreshState = () => {
        window.web3 = new Web3(process.env.REACT_APP_ETHEREUM_API);
        setWACMEBalance(0);
        setStACMEBalance(0);
        setWACMEAllowance(0);
    }

    const compare = (allowance, value) => {
        let amount = value*pow;
        if (allowance > amount) {
          return true;
        }
        return false;
    }

    const getAmount = (value) => {
        let amount = 0;
        if (value !== "") {
          amount = parseFloat(value) || 0;
        }
        return amount;
      }

    const handleChangeWACMEAmount = (event) => {
        if (isNaN(Number(event.target.value))) {
            return
        }
        if (decimalCount(event.target.value) > 8) {
            setWACMEAmount(toRoundedDown(event.target.value, 8));
            return
        }
        setWACMEAmount(event.target.value);
    };

    const handleChangeStACMEAmount = (event) => {
        if (isNaN(Number(event.target.value))) {
            return
        }
        if (decimalCount(event.target.value) > 8) {
            setStACMEAmount(toRoundedDown(event.target.value, 8));
            return
        }
        setStACMEAmount(event.target.value);
    };

    const getBalance = (address) => {
        const contract = new window.web3.eth.Contract(TokenABI, address);
        contract.methods.balanceOf(account).call().then(balance_ => {
            if (address === wacmeContract) {
                setWACMEBalance(web3BNToFloatString(balance_, pow, 8));
            }
            if (address === stacmeContract) {
                setStACMEBalance(web3BNToFloatString(balance_, pow, 8));
            }
        })
    };
    
    const getAllowance = (address, spender) => {
        const contract = new window.web3.eth.Contract(TokenABI, address);
        contract.methods.allowance(account, spender).call().then(allowance_ => {
            if (address === wacmeContract) {
                setWACMEAllowance(allowance_);
            }
            if (address === stacmeContract) {
                // setstACMEAllowance(allowance_);
            }
        })
    };

    const handleApprove = (address, spender) => {
        let contract = new window.web3.eth.Contract(TokenABI, address);
        if (address === wacmeContract && spender === lsContract._address) {
            setWACMEIsApprovingLS(true);
        }
        if (contract) {
            message.info("Please sign the approval tx");
            contract.methods.approve(spender, maxApproval)
            .send({from: account})
            .once("transactionHash", async (txhash) => {
                setWACMEFormTxHash(txhash);
            }).then(_ => {
                if (address === wacmeContract && spender === lsContract._address) {
                    setWACMEIsApprovingLS(false);
                }
                getAllowance(address, spender);
            }).catch(error => {
                if (error.message) {
                    message.error(error.message);
                }
                setWACMEIsApprovingLS(false);
            });
        }
    };

    const handleWACMEDeposit = () => {
        let contract = new window.web3.eth.Contract(LiquidStakingABI, lsContract._address);
        const amountBig = new BigNumber(wacmeAmount, 10)*1e8;
        contract.methods.deposit_WACME(amountBig)
        .send({from: account})
        .once("transactionHash", async (txhash) => {
            setWACMEFormTxHash(txhash);
        }).then(_ => {
            getBalance(wacmeContract);
            getBalance(stacmeContract);
            setWACMEAmount(0);
        }).catch(error => {
            if (error.message) {
                message.error(error.message);
            }
        });
    };
        
    const getStakingTVL = async () => {
        try {
            let params = {url: stakingAccount};
            const response = await AccumulateAPI.request("query", params);
            if (response && response.data && response.data.balance) {
                setStakingTVL(response.data.balance);
            } else {
                throw new Error("Token account " + stakingAccount + " not found"); 
            }
        }
        catch(error) {
            setStakingTVL(null);
        }
    }

    const getACMEPrice = async () => {

        setACMEPrice(null);
    
        try {
            const response = await axios.get("https://api.coingecko.com/api/v3/coins/wrapped-accumulate");
            if (response && response.data.market_data && response.data.market_data.current_price && response.data.market_data.current_price.usd) {
                setACMEPrice(response.data.market_data.current_price.usd);
            } else {
                throw new Error("Coingecko API is not available"); 
            }
        }
        catch(error) {
            setACMEPrice(null);
            message.error(error.message);
        }
    
    }

    useEffect(() => {
        window.web3 = new Web3(process.env.REACT_APP_ETHEREUM_API);
        getACMEPrice();
        let contract = new window.web3.eth.Contract(LiquidStakingABI, process.env.REACT_APP_LIQUID_STAKING_CONTRACT);
        setLSContract(contract);
    }, []);

    useEffect(() => {
        if (lsContract) {
            lsContract.methods.wacme().call().then(setWACMEContract);
            lsContract.methods.stacme().call().then(setStACMEContract);
            lsContract.methods.stakingAccount().call().then(setStakingAccount);
        }
    }, [lsContract])

    useEffect(() => {
        if (stakingAccount) {
            getStakingTVL();
        }
    }, [stakingAccount]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (wacmeContract && lsContract && lsContract._address && account) {
            getBalance(wacmeContract);
            getAllowance(wacmeContract, lsContract._address);
        }
        if (stacmeContract && lsContract && lsContract._address && account) {
            getBalance(stacmeContract);
        }
    }, [account]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Router>
            <ScrollToTop />
            <Layout>

                <Header>
                    <Link to="/">
                        <Logo />
                    </Link>
                    {!active ? (
                        <Button size="large" className="connect-button" shape="round" onClick={() => connect()}>
                            <Badge color={"blue"} text="Connect Wallet" />
                        </Button>
                    ) : 
                        <Popover arrow={false} overlayClassName={"popover-connected"} content={
                            <div>
                                <Paragraph>
                                    <Text type="secondary">Account</Text><br />
                                    <Text copyable>{account ? account : "No account"}</Text>
                                </Paragraph>
                                <Paragraph style={{marginTop: 8}}>
                                    <Button type="primary" danger onClick={() => disconnect()}>Disconnect</Button>
                                </Paragraph>
                            </div>
                        } trigger="click" placement="bottomRight">
                            <Button size="large" className="connect-button" shape="round">
                                {chainId === parseInt(process.env.REACT_APP_CHAIN_ID) ? (
                                    <Badge color={"green"} text={account ? truncateAddress(account) : "Connected"} />
                                ) :
                                    <Badge color={"red"} text="Invalid Network" />
                                }
                            </Button>
                        </Popover>
                    }
                    <Button size="large" className="connect-button" shape="round" style={{ marginRight: 10 }} onClick={showModal}>
                        ACFI
                    </Button>
                </Header>

                <Content style={{ padding: '25px 20px 30px 20px', margin: 0 }}>
                    
                    <Row className="headline">
                        <Col span={24}>
                            <Title>ACME Liquid Staking</Title>
                            <Title level={2}>Earn ACME staking rewards.<br />Unstake at any time.</Title>
                            <Row gutter={[16,32]} justify="center" style={{marginTop: '60px', marginBottom: '15px'}}>
                                <Col xs={24} sm={8} md={7} lg={6} xl={5}>
                                    <IconContext.Provider value={{ className: 'react-icons' }}><RiSafe2Line /></IconContext.Provider>
                                    <Statistic title="TVL" value={stakingTVL && acmePrice ? acmePrice*stakingTVL/(10**11) : "..."} prefix={stakingTVL && acmePrice ? "$" : null} suffix={stakingTVL && acmePrice ? "k" : null} formatter={stakingTVL && acmePrice ? formatterDecimals : null} />
                                </Col>
                                <Col xs={24} sm={8} md={7} lg={6} xl={5}>
                                    <IconContext.Provider value={{ className: 'react-icons' }}><RiDropLine /></IconContext.Provider>
                                    <Statistic title="Total ACME staked" value={stakingTVL ? (stakingTVL/(10**8)) : "..."} suffix={stakingTVL ? "ACME" : null} formatter={stakingTVL ? formatter : null} />
                                </Col>
                                <Col xs={24} sm={8} md={7} lg={6} xl={5}>
                                    <IconContext.Provider value={{ className: 'react-icons' }}><RiFundsLine /></IconContext.Provider>
                                    <Tooltip title="Rewards will be distributed after ACFI token launch" placement='bottom'>
                                        <Statistic title="Paid rewards to veACFI" value={0} suffix={"ACME"} formatter={formatter} />
                                    </Tooltip>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row className="sections">
                        <Col md={{ span: 24, offset: 0 }} lg={{ span: 18, offset: 3 }} style={{ width: "100%" }}>
                            <Collapse size="large" defaultActiveKey="1">
                                <Panel header={<div>ACME Liquid Staking<IconContext.Provider value={{ className: 'react-icons react-icons-blue' }}><RiDropFill /></IconContext.Provider></div>} key="1">
                                    <ul>
                                        <li>Deposit WACME to get stACME</li>
                                        <li>By staking stACME, you are earning a share of ACME staking rewards</li>
                                    </ul>
                                    <Tabs
                                        size="large"
                                        defaultActiveKey="1"
                                            items={[
                                            {
                                                label: 'Deposit WACME',
                                                key: '1',
                                                children: 
                                                    <div>
                                                        <Alert message={
                                                            <div>
                                                                <Title level={5}><IconContext.Provider value={{ className: 'react-icons react-icons-green' }}><RiGiftLine /></IconContext.Provider> ACFI distribution for early users  <Tag color="#87d068" style={{verticalAlign: 'top', marginTop: 1}}>ACTIVE</Tag></Title>
                                                                <Countdown title="Deposit WACME during the early bird period to participate:" value={deadline} format="Dd HH:mm:ss" />
                                                            </div>
                                                        }
                                                        type="success" style={{marginBottom: 15}} />
                                                        <div className="web3-form">
                                                            <Form
                                                                layout="vertical"
                                                                size={"large"}
                                                                style={{maxWidth: 300}}
                                                                >
                                                                <Form.Item label="Amount of WACME to deposit:">
                                                                    <Input onChange={handleChangeWACMEAmount} value={wacmeAmount} addonAfter={<Text>WACME<img src={WACMELogo} className="token-logo" alt="WACME" /></Text>} />
                                                                    <Link onClick={() => { setWACMEAmount(wacmeBalance); }}>Available: {wacmeBalance} WACME</Link>
                                                                </Form.Item>
                                                                <Form.Item label="You will receive:">
                                                                    <Input onChange={handleChangeWACMEAmount} value={wacmeAmount} addonAfter={<Text>stACME<img src={stACMELogo} className="token-logo" alt="stACME" /></Text>} />
                                                                </Form.Item>
                                                                <Form.Item className="web3-buttons">
                                                                    <Button size="large" type="primary" onClick={() => handleApprove(wacmeContract, lsContract._address)} disabled={compare(wacmeAllowance, wacmeAmount) || wacmeIsApprovingLS || !account}>{wacmeIsApprovingLS ? "Approving..." : "Approve"}</Button>
                                                                    <Button size="large" type="primary" onClick={handleWACMEDeposit} disabled={!compare(wacmeAllowance, wacmeAmount) || getAmount(wacmeAmount) === 0 || wacmeIsApprovingLS || !account}>Deposit</Button>
                                                                </Form.Item>
                                                            </Form>
                                                            {wacmeFormTxHash ? (
                                                                <Alert message={<Text>Tx sent: <a href={etherscan + "/tx/" + wacmeFormTxHash} target="_blank" rel="noreferrer">{wacmeFormTxHash}<IconContext.Provider value={{ className: 'react-icons' }}><RiExternalLinkLine /></IconContext.Provider></a></Text>} type="success" showIcon />                                                                
                                                            ) : null}
                                                        </div>
                                                    </div>,
                                            },
                                            {
                                                label: 'Stake stACME',
                                                key: '2',
                                                children: <div className="web3-form">
                                                    <Form
                                                        layout="vertical"
                                                        size={"large"}
                                                        style={{maxWidth: 300}}
                                                        >
                                                        <Form.Item label="Amount of stACME to stake:">
                                                            <Input onChange={handleChangeStACMEAmount} value={stacmeAmount} addonAfter={<Text>stACME<img src={stACMELogo} className="token-logo" alt="stACME" /></Text>} />
                                                            <Link onClick={() => { setStACMEAmount(stacmeBalance); }}>Available: {stacmeBalance} stACME</Link>
                                                        </Form.Item>
                                                        <Form.Item>
                                                            <Text mark>The staking contract will be deployed after the early bird period</Text>
                                                        </Form.Item>
                                                        <Form.Item className="web3-buttons">
                                                            <Button size="large" type="primary" disabled>Approve</Button>
                                                            <Button size="large" type="primary" disabled>Stake</Button>
                                                        </Form.Item>
                                                    </Form>
                                                </div>,
                                            },
                                        ]}
                                    />
                                    <Descriptions layout="vertical" column={1} style={{marginTop:10}}>
                                        <Descriptions.Item label="WACME">{wacmeContract ? <a href={etherscan + "/address/" + wacmeContract} target="_blank" rel="noreferrer"><Text copyable>{wacmeContract}</Text></a> : null}</Descriptions.Item>
                                        <Descriptions.Item label="stACME">{stacmeContract ? <a href={etherscan + "/address/" + stacmeContract} target="_blank" rel="noreferrer"><Text copyable>{stacmeContract}</Text></a> : null}</Descriptions.Item>
                                        <Descriptions.Item label="Deposit contract">{lsContract && lsContract._address ? <a href={etherscan + "/address/" + lsContract._address} target="_blank" rel="noreferrer"><Text copyable>{lsContract._address}</Text></a> : null}</Descriptions.Item>
                                    </Descriptions>
                                </Panel>
                            </Collapse>
                            <Collapse size="large">
                                <Panel header={<div>Curve stACME/WACME Yield Farming<IconContext.Provider value={{ className: 'react-icons react-icons-green' }}><RiMoneyDollarCircleFill /></IconContext.Provider></div>} key="1">
                                    <ul>
                                        <li>Provide liquidity into stACME/WACME Curve pool, get WACME rewards</li>
                                    </ul>
                                </Panel>
                            </Collapse>
                            <Collapse size="large">
                                <Panel header={<div>ACFI Locker<IconContext.Provider value={{ className: 'react-icons react-icons-yellow' }}><RiLock2Fill /></IconContext.Provider></div>} key="1">
                                    <ul>
                                        <li>ACFI is Accumulated Finance governance token</li>
                                        <li>Lock ACFI to get veACFI <Text type="secondary">(voting escrow ACFI)</Text></li>
                                        <li>veACFI participates in platform governance</li>
                                        <li>veACFI earns platform fees</li>
                                    </ul>
                                </Panel>
                            </Collapse>
                        </Col>
                    </Row>
                    
                </Content>

                <Footer>
                    <Paragraph>
                        <Text><strong>&copy; {new Date().getFullYear()} Accumulated Finance</strong></Text>
                        <br />
                        <Text className={"made-by"}>Made with <IconContext.Provider value={{ className: 'react-icons' }}><RiHeartFill /></IconContext.Provider> by <a href="https://twitter.com/defacto_team" target="_blank" rel="noreferrer">De Facto</a></Text>
                    </Paragraph>
                    <Paragraph>
                        <a className={"made-by"} href="https://docs.accumulated.finance" target="_blank" rel="noreferrer">Docs</a>
                        <Divider type="vertical" />
                        <a className={"icon-link"} href="https://github.com/AccumulatedFinance" target="_blank" rel="noreferrer">
                            <IconContext.Provider value={{ className: 'react-icons' }}><RiGithubFill /></IconContext.Provider>
                        </a>
                        <Divider type="vertical" className={"divider-invisible"} />
                        <a className={"icon-link"} href="https://twitter.com/AccumulatedFi" target="_blank" rel="noreferrer">
                            <IconContext.Provider value={{ className: 'react-icons' }}><RiTwitterFill /></IconContext.Provider>
                        </a>
                        <Divider type="vertical" className={"divider-invisible"} />
                        <a className={"icon-link"} href="https://t.me/AccumulatedFi" target="_blank" rel="noreferrer">
                            <IconContext.Provider value={{ className: 'react-icons' }}><RiTelegramFill /></IconContext.Provider>
                        </a>
                        <Divider type="vertical" className={"divider-invisible"} />
                        <a className={"icon-link"} href="https://medium.com/AccumulatedFi" target="_blank" rel="noreferrer">
                            <IconContext.Provider value={{ className: 'react-icons' }}><RiMediumFill /></IconContext.Provider>
                        </a>
                    </Paragraph>
                </Footer>

            </Layout>

            <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={2} style={{marginBottom: 5}}><LogoToken />ACFI</Title>
                    <Title level={5} style={{marginTop: 0, marginBottom: 20, fontWeight: 400}}>Accumulated Finance Governance Token</Title>
                    <p><Text type="secondary">50% of the platform fees will be distributed to ACFI holders who have locked their tokens (Voting Escrow model)</Text></p>
                </div>
                <Divider />
                <Title level={4}>Participate in ACFI distribution</Title>
                <p><Text type="secondary">There will be several rounds of distribution to the community and early adopters:</Text></p>
                <Timeline
                    pending="To be continued..."
                    items={[
                    {
                        children: (
                            <p><Text type="secondary">February 20 – March 9</Text><br />ACME Liquid Staking Early Users</p>
                        ),
                        color: 'green'
                    },
                    {
                        children: (
                            <p><Text type="secondary">To be announced</Text><br />Curve stACME/WACME Early Liquidity Providers</p>
                        ),
                        color: 'gray'
                    },
                    ]}
                    style={{marginTop: 30}}
                />
            </Modal>
        </Router>
  );
};

export default AccumulatedFinance;
