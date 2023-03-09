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
    RiHeartFill, RiFundsLine, RiDropLine, RiSafe2Line, RiExternalLinkLine, RiGithubFill, RiTwitterFill, RiTelegramFill, RiMediumFill, RiPercentLine, RiHandCoinLine, RiLogoutBoxLine, RiWaterFlashLine, RiInformationLine
} from 'react-icons/ri';

import {
    TbSquareRoundedNumber1Filled, TbSquareRoundedNumber2Filled
} from 'react-icons/tb';

import {
    CheckCircleOutlined, ClockCircleOutlined
  } from '@ant-design/icons';

import Logo from './common/Logo';
import LogoToken from './common/LogoToken';
import ScrollToTop from './common/ScrollToTop';
import AccumulateAPI from './common/AccumulateAPI';

import { truncateAddress, web3BNToFloatString, toRoundedDown, decimalCount, calculateAPR } from "./utils";
import BigNumber from 'bignumber.js'

import LiquidStakingABI from './../abi/ACMELIquidStaking.json';
import TokenABI from './../abi/WrappedToken.json';
import StakingRewardsABI from './../abi/StakingRewards.json';

import stACMELogo from './../stacme.svg';
import WACMELogo from './../wacme.svg';
import ACFILogo from './../acfi.svg';

const { Panel } = Collapse;
const { Header, Content, Footer } = Layout;
const { Text, Paragraph, Title } = Typography;

const AccumulatedFinance = props => {

    const etherscan = process.env.REACT_APP_ETHERSCAN;
    const pow = new BigNumber('10').pow(new BigNumber(8));
    const maxApproval = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

    const tvlSuffix = "k";
    const tvlDivider = 1000;

    const formatter = (value) => <CountUp end={value} duration={0.75} decimals={0} separator="," />;
    const formatterDecimals = (value) => <CountUp end={value} duration={0.75} decimals={1} separator="," />;

    const [lsContract, setLSContract] = useState(null);
    const [wacmeContract, setWACMEContract] = useState(null);
    const [stacmeContract, setStACMEContract] = useState(null);
    const [srContract, setSRContract] = useState(null);
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
    const [stacmeAllowance, setStACMEAllowance] = useState(0);
    const [stacmeIsApprovingSR, setStACMEIsApprovingSR] = useState(false);
    const [stacmeFormTxHash, setStACMEFormTxHash] = useState(null);

    const [stacmeEarned, setStACMEEarned] = useState(0);
    const [stakingRewardRate, setStakingRewardRate] = useState(0);
    const [stakingRewardDuration, setStakingRewardDuration] = useState(0);
    const [stakingTotal, setStakingTotal] = useState(0);

    const [stakedBalanceRaw, setStakedBalanceRaw] = useState(0);
    const [stakedBalance, setStakedBalance] = useState(0);
    const [stakedAmount, setStakedAmount] = useState(0);
    const [unstakeFormTxHash, setUnstakeFormTxHash] = useState(null);

    const [claimFormTxHash, setClaimFormTxHash] = useState(null);

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
        setStACMEEarned(0);
        setStakedBalance(0);
        setStakedBalanceRaw(0);
    }

    const compare = (allowance, value) => {
        let amount = value*pow;
        if (allowance >= amount) {
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

    const handleChangeStakedAmount = (event) => {
        if (isNaN(Number(event.target.value))) {
            return
        }
        if (decimalCount(event.target.value) > 8) {
            setStakedAmount(toRoundedDown(event.target.value, 8));
            return
        }
        setStakedAmount(event.target.value);
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

    const getStakingData = () => {
        const contract = new window.web3.eth.Contract(StakingRewardsABI, srContract._address);
        contract.methods.balanceOf(account).call().then(balance_ => {
            setStakedBalanceRaw(balance_);
            setStakedBalance(web3BNToFloatString(balance_, pow, 8));
        })
        contract.methods.earned(account).call().then(balance_ => {
            setStACMEEarned(web3BNToFloatString(balance_, pow, 8));
        })
    };

    const refreshStakingRewardsContract = () => {
        srContract.methods.rewardRate().call().then(setStakingRewardRate);
        srContract.methods.totalSupply().call().then(setStakingTotal);
        srContract.methods.duration().call().then(setStakingRewardDuration);
    }
    
    const getAllowance = (address, spender) => {
        const contract = new window.web3.eth.Contract(TokenABI, address);
        contract.methods.allowance(account, spender).call().then(allowance_ => {
            if (address === wacmeContract) {
                setWACMEAllowance(allowance_);
            }
            if (address === stacmeContract) {
                setStACMEAllowance(allowance_);
            }
        })
    };

    const handleApprove = (address, spender) => {
        let contract = new window.web3.eth.Contract(TokenABI, address);
        if (address === wacmeContract && spender === lsContract._address) {
            setWACMEIsApprovingLS(true);
        }
        if (address === stacmeContract && spender === srContract._address) {
            setStACMEIsApprovingSR(true);
        }
        if (contract) {
            message.info("Please sign the approval tx");
            contract.methods.approve(spender, maxApproval)
            .send({from: account})
            .once("transactionHash", async (txhash) => {
                if (address === wacmeContract) {
                    setWACMEFormTxHash(txhash);                    
                }
                if (address === stacmeContract) {
                    setStACMEFormTxHash(txhash);
                }
            }).then(_ => {
                if (address === wacmeContract && spender === lsContract._address) {
                    setWACMEIsApprovingLS(false);
                }
                if (address === stacmeContract && spender === srContract._address) {
                    setStACMEIsApprovingSR(false);
                }
                getAllowance(address, spender);
            }).catch(error => {
                if (error.message) {
                    message.error(error.message);
                }
                setWACMEIsApprovingLS(false);
                setStACMEIsApprovingSR(false);
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

    const handleStACMEStake = () => {
        let contract = new window.web3.eth.Contract(StakingRewardsABI, srContract._address);
        const amountBig = new BigNumber(stacmeAmount, 10)*1e8;
        contract.methods.stake(amountBig)
        .send({from: account})
        .once("transactionHash", async (txhash) => {
            setStACMEFormTxHash(txhash);
        }).then(_ => {
            getBalance(stacmeContract);
            getStakingData();
            setStACMEAmount(0);
            refreshStakingRewardsContract();
        }).catch(error => {
            if (error.message) {
                message.error(error.message);
            }
        });
    };

    const handleStACMEUnstake = () => {
        let contract = new window.web3.eth.Contract(StakingRewardsABI, srContract._address);
        const amountBig = new BigNumber(stakedAmount, 10)*1e8;
        contract.methods.withdraw(amountBig)
        .send({from: account})
        .once("transactionHash", async (txhash) => {
            setUnstakeFormTxHash(txhash);
        }).then(_ => {
            getBalance(stacmeContract);
            getStakingData();
            setStakedAmount(0);
            refreshStakingRewardsContract();
        }).catch(error => {
            if (error.message) {
                message.error(error.message);
            }
        });
    };

    const handleGetReward = () => {
        let contract = new window.web3.eth.Contract(StakingRewardsABI, srContract._address);
        contract.methods.getReward()
        .send({from: account})
        .once("transactionHash", async (txhash) => {
            setClaimFormTxHash(txhash);
        }).then(_ => {
            getBalance(stacmeContract);
            getStakingData();
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
        let contract2 = new window.web3.eth.Contract(StakingRewardsABI, process.env.REACT_APP_STAKING_REWARDS_CONTRACT);
        setSRContract(contract2);
    }, []);

    useEffect(() => {
        if (lsContract) {
            lsContract.methods.wacme().call().then(setWACMEContract);
            lsContract.methods.stacme().call().then(setStACMEContract);
            lsContract.methods.stakingAccount().call().then(setStakingAccount);
        }
    }, [lsContract])

    useEffect(() => {
        if (srContract) {
            refreshStakingRewardsContract();
        }
    }, [srContract]) // eslint-disable-line react-hooks/exhaustive-deps

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
        if (stacmeContract && srContract && srContract._address && account) {
            getBalance(stacmeContract);
            getAllowance(stacmeContract, srContract._address);
            getStakingData();
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
                                    <Statistic title="TVL" value={stakingTVL && acmePrice ? acmePrice*stakingTVL/(10**8)/tvlDivider : "..."} prefix={stakingTVL && acmePrice ? "$" : null} suffix={stakingTVL && acmePrice ? tvlSuffix : null} formatter={stakingTVL && acmePrice ? formatterDecimals : null} />
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
                            <Collapse size="large" expandIcon={null}>
                                <Panel header={
                                    <Row gutter={[0,8]}>
                                        <Col xs={24} sm={14}>
                                            <nobr>
                                                <img src={stACMELogo} alt="stACME" className="product-logo" />
                                                ACME Liquid Staking
                                            </nobr>
                                        </Col>
                                        <Col xs={24} sm={10} className="product-tags">
                                            <Tag color="#1677ff" style={{fontWeight: "normal"}}>TVL: {acmePrice && stakingTotal ? ( <strong>${(acmePrice*stakingTotal/10**8/tvlDivider).toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}{tvlSuffix}</strong> ) : "..."}</Tag>
                                            <Tag color="#2f54eb" style={{fontWeight: "normal"}}>APR: {stakingRewardRate && stakingRewardDuration && stakingRewardDuration > 0 && stakingTotal && stakingTotal > 0 ? ( <strong>{calculateAPR(stakingRewardRate, stakingRewardDuration, stakingTotal)} %</strong> ) : "..."}</Tag>
                                        </Col>
                                    </Row>
                                } key="1">
                                    {!stakingRewardRate || stakingRewardRate === "0" || stakingRewardRate === 0 ? (
                                        <Alert
                                            message={<span>First liquid staking rewards will be distributed to stACME stakers on <strong>March 17-20.</strong><br />Liquid Staking <strong>APR will be calculated</strong> based on the amount of first rewards.<br />You can stake your stACME in advance.</span>}
                                            showIcon={false}
                                            type="success"
                                            className="banner-description"
                                        />
                                    ) : null}
                                    <Alert
                                        message={
                                            <Row gutter={[0,8]}>
                                                <Col xs={24} sm={10}>
                                                    <strong>My staked stACME:</strong>
                                                    <br />
                                                    {stakedBalance.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} stACME
                                                </Col>
                                                <Col xs={24} sm={10}>
                                                    <strong>My rewards:</strong>
                                                    <br />
                                                    {stacmeEarned.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} stACME
                                                </Col>
                                                <Col xs={24} sm={4}>
                                                    <strong>My APR:</strong>
                                                    <br />
                                                    {stakingRewardRate && stakingRewardDuration && stakingRewardDuration > 0 && stakingTotal && stakingTotal > 0 ? calculateAPR(stakingRewardRate, stakingRewardDuration, stakingTotal) + " %" : "..."}
                                                </Col>
                                            </Row>
                                        }
                                        showIcon={false}
                                        type="info"
                                        className="banner-description"
                                    />
                                    <Tabs
                                        size="middle"
                                        defaultActiveKey="1"
                                            items={[
                                            {
                                                label: (<div><IconContext.Provider value={{ className: 'react-icons' }}><RiWaterFlashLine /></IconContext.Provider> Deposit WACME</div>),
                                                key: '1',
                                                children: 
                                                    <div>
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
                                                                    <Button size="large" type="primary" onClick={() => handleApprove(wacmeContract, lsContract._address)} disabled={compare(wacmeAllowance, wacmeAmount) || wacmeIsApprovingLS || !account}><IconContext.Provider value={{ className: 'react-icons' }}><TbSquareRoundedNumber1Filled /></IconContext.Provider>{wacmeIsApprovingLS ? "Approving..." : "Approve"}</Button>
                                                                    <Button size="large" type="primary" onClick={handleWACMEDeposit} disabled={!compare(wacmeAllowance, wacmeAmount) || getAmount(wacmeAmount) === 0 || wacmeIsApprovingLS || !account}><IconContext.Provider value={{ className: 'react-icons' }}><TbSquareRoundedNumber2Filled /></IconContext.Provider>Deposit</Button>
                                                                </Form.Item>
                                                            </Form>
                                                            {wacmeFormTxHash ? (
                                                                <Alert message={<Text>Tx sent: <a href={etherscan + "/tx/" + wacmeFormTxHash} target="_blank" rel="noreferrer">{wacmeFormTxHash}<IconContext.Provider value={{ className: 'react-icons' }}><RiExternalLinkLine /></IconContext.Provider></a></Text>} type="success" showIcon />                                                                
                                                            ) : null}
                                                        </div>
                                                    </div>,
                                            },
                                            {
                                                label: (<div><IconContext.Provider value={{ className: 'react-icons' }}><RiPercentLine /></IconContext.Provider> Stake stACME</div>),
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
                                                        <Form.Item className="web3-buttons">
                                                            <Button size="large" type="primary" onClick={() => handleApprove(stacmeContract, srContract._address)} disabled={compare(stacmeAllowance, stacmeAmount) || stacmeIsApprovingSR || !account}><IconContext.Provider value={{ className: 'react-icons' }}><TbSquareRoundedNumber1Filled /></IconContext.Provider>{stacmeIsApprovingSR ? "Approving..." : "Approve"}</Button>
                                                            <Button size="large" type="primary" onClick={handleStACMEStake} disabled={!compare(stacmeAllowance, stacmeAmount) || getAmount(stacmeAmount) === 0 || stacmeIsApprovingSR || !account}><IconContext.Provider value={{ className: 'react-icons' }}><TbSquareRoundedNumber2Filled /></IconContext.Provider>Stake</Button>
                                                        </Form.Item>
                                                    </Form>
                                                    {stacmeFormTxHash ? (
                                                        <Alert message={<Text>Tx sent: <a href={etherscan + "/tx/" + stacmeFormTxHash} target="_blank" rel="noreferrer">{stacmeFormTxHash}<IconContext.Provider value={{ className: 'react-icons' }}><RiExternalLinkLine /></IconContext.Provider></a></Text>} type="success" showIcon />                                                                
                                                    ) : null}
                                                </div>,
                                            },
                                            {
                                                label: (<div><IconContext.Provider value={{ className: 'react-icons' }}><RiHandCoinLine /></IconContext.Provider> Claim rewards
                                                {acmePrice && stacmeEarned && stacmeEarned !== "0.00000000" ? (<span className="earned-usd">(${(stacmeEarned*acmePrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})</span> ) : null}
                                                </div>),
                                                key: '3',
                                                children: <div className="web3-form">
                                                    <Form
                                                        layout="vertical"
                                                        size={"large"}
                                                        style={{maxWidth: 300}}
                                                        >
                                                        <Form.Item label="Staking rewards">
                                                            You have earned: <strong>{stacmeEarned} stACME</strong><br />
                                                            Liquid staking APR: <strong>{stakingRewardRate && stakingRewardDuration && stakingRewardDuration > 0 && stakingTotal && stakingTotal > 0 ? calculateAPR(stakingRewardRate, stakingRewardDuration, stakingTotal) + " %" : "..."}</strong>
                                                        </Form.Item>
                                                        <Form.Item className="web3-buttons">
                                                            <Button size="large" type="primary" onClick={handleGetReward} disabled={!account}>Claim all</Button>
                                                        </Form.Item>
                                                    </Form>
                                                    {claimFormTxHash ? (
                                                        <Alert message={<Text>Tx sent: <a href={etherscan + "/tx/" + claimFormTxHash} target="_blank" rel="noreferrer">{claimFormTxHash}<IconContext.Provider value={{ className: 'react-icons' }}><RiExternalLinkLine /></IconContext.Provider></a></Text>} type="success" showIcon />                                                                
                                                    ) : null}
                                                </div>,
                                            },
                                            {
                                                label: (<div><IconContext.Provider value={{ className: 'react-icons' }}><RiLogoutBoxLine /></IconContext.Provider> Unstake stACME</div>),
                                                key: '4',
                                                children: <div className="web3-form">
                                                    <Form
                                                        layout="vertical"
                                                        size={"large"}
                                                        style={{maxWidth: 300}}
                                                        >
                                                        <Form.Item label="Amount of stACME to unstake:">
                                                            <Input onChange={handleChangeStakedAmount} value={stakedAmount} addonAfter={<Text>stACME<img src={stACMELogo} className="token-logo" alt="stACME" /></Text>} />
                                                            <Link onClick={() => { setStakedAmount(stakedBalance); }}>Staked: {stakedBalance} stACME</Link>
                                                        </Form.Item>
                                                        <Form.Item className="web3-buttons">
                                                            <Button size="large" type="primary" onClick={handleStACMEUnstake} disabled={!compare(stakedBalanceRaw, stakedAmount) || getAmount(stakedAmount) === 0 || !account}>Unstake</Button>
                                                        </Form.Item>
                                                    </Form>
                                                    {unstakeFormTxHash ? (
                                                        <Alert message={<Text>Tx sent: <a href={etherscan + "/tx/" + unstakeFormTxHash} target="_blank" rel="noreferrer">{unstakeFormTxHash}<IconContext.Provider value={{ className: 'react-icons' }}><RiExternalLinkLine /></IconContext.Provider></a></Text>} type="success" showIcon />                                                                
                                                    ) : null}
                                                </div>,
                                            },
                                            {
                                                label: (<div><IconContext.Provider value={{ className: 'react-icons' }}><RiInformationLine /></IconContext.Provider> Information</div>),
                                                key: '5',
                                                children: <div className="web3-form web3-form-info">
                                                    <Title level={5}>Information</Title>
                                                    <ul>
                                                        <li>Deposit WACME to get stACME</li>
                                                        <li>By staking stACME, you are earning a share of ACME staking rewards</li>
                                                        <li>Rewards are distributed continuously over a one week period</li>
                                                        <li>Rewards are auto-compounded on the protocol level every week</li>
                                                    </ul>
                                                    <Divider />
                                                    <Descriptions layout="vertical" column={1} style={{marginTop:10}}>
                                                        <Descriptions.Item label="WACME">{wacmeContract ? <a href={etherscan + "/address/" + wacmeContract} target="_blank" rel="noreferrer"><Text copyable>{wacmeContract}</Text></a> : null}</Descriptions.Item>
                                                        <Descriptions.Item label="stACME">{stacmeContract ? <a href={etherscan + "/address/" + stacmeContract} target="_blank" rel="noreferrer"><Text copyable>{stacmeContract}</Text></a> : null}</Descriptions.Item>
                                                        <Descriptions.Item label="Deposit contract">{lsContract && lsContract._address ? <a href={etherscan + "/address/" + lsContract._address} target="_blank" rel="noreferrer"><Text copyable>{lsContract._address}</Text></a> : null}</Descriptions.Item>
                                                        <Descriptions.Item label="Rewards contract">{srContract && srContract._address ? <a href={etherscan + "/address/" + srContract._address} target="_blank" rel="noreferrer"><Text copyable>{srContract._address}</Text></a> : null}</Descriptions.Item>
                                                    </Descriptions>
                                                </div>,
                                            },
                                        ]}
                                    />
                                </Panel>
                            </Collapse>
                            <Collapse size="large">
                                <Panel header={
                                    <Row gutter={[0,8]}>
                                        <Col xs={24} sm={14}>
                                            <nobr>
                                                <img src={stACMELogo} alt="stACME" className="product-logo" style={{marginRight: 26}} />
                                                <img src={WACMELogo} alt="WACME" className="product-logo product-logo-overlay" />
                                                stACME/WACME Curve LP
                                            </nobr>
                                        </Col>
                                        <Col xs={24} sm={10} className="product-tags"><Tag color="#7cb305">Launch soon</Tag></Col>
                                    </Row>
                                } key="1">
                                    <Alert
                                        message={<span>stACME/WACME pool will be launched soon</span>}
                                        showIcon={false}
                                        type="info"
                                        className="banner-description"
                                    />
                                    <Tabs
                                        size="middle"
                                        defaultActiveKey="1"
                                            items={[
                                            {
                                                label: (<div><IconContext.Provider value={{ className: 'react-icons' }}><RiInformationLine /></IconContext.Provider> Information</div>),
                                                key: '1',
                                                children: <div className="web3-form web3-form-info">
                                                    <Title level={5}>Information</Title>
                                                    <ul>
                                                        <li>Deposit WACME or stACME to stACME/WACME pool on Curve Finance</li>
                                                        <li>Stake your liquidity position on Curve to earn WACME rewards</li>
                                                    </ul>
                                                    <Divider />
                                                    <Descriptions layout="vertical" column={1} style={{marginTop:10}}>
                                                        <Descriptions.Item label="WACME">{wacmeContract ? <a href={etherscan + "/address/" + wacmeContract} target="_blank" rel="noreferrer"><Text copyable>{wacmeContract}</Text></a> : null}</Descriptions.Item>
                                                        <Descriptions.Item label="stACME">{stacmeContract ? <a href={etherscan + "/address/" + stacmeContract} target="_blank" rel="noreferrer"><Text copyable>{stacmeContract}</Text></a> : null}</Descriptions.Item>
                                                        <Descriptions.Item label="stACME/WACME LP"><Text>Not deployed yet</Text></Descriptions.Item>
                                                    </Descriptions>
                                                </div>,
                                            },
                                        ]}
                                    />
                                </Panel>
                            </Collapse>
                            <Collapse size="large">
                                <Panel header={
                                    <Row gutter={[0,8]}>
                                        <Col xs={24} sm={14}>
                                            <nobr>
                                                <img src={ACFILogo} alt="ACFI" className="product-logo" />
                                                ACFI Locker
                                            </nobr>
                                        </Col>
                                        <Col xs={24} sm={10} className="product-tags"><Tag color="#7cb305">Launch soon</Tag></Col>
                                    </Row>
                                } key="1">
                                    <Alert
                                        message={<span>ACFI will be launched soon</span>}
                                        showIcon={false}
                                        type="info"
                                        className="banner-description"
                                    />
                                    <Tabs
                                        size="middle"
                                        defaultActiveKey="1"
                                            items={[
                                            {
                                                label: (<div><IconContext.Provider value={{ className: 'react-icons' }}><RiInformationLine /></IconContext.Provider> Information</div>),
                                                key: '1',
                                                children: <div className="web3-form web3-form-info">
                                                    <Title level={5}>Information</Title>
                                                    <ul>
                                                        <li>Lock ACFI to get vlACFI <Text type="secondary">(voting lock ACFI)</Text></li>
                                                        <li>vlACFI will give you voting weight in governance proposals</li>
                                                        <li>vlACFI will earn platform fees</li>
                                                    </ul>
                                                    <Divider />
                                                    <Descriptions layout="vertical" column={1} style={{marginTop:10}}>
                                                        <Descriptions.Item label="ACFI"><Text>Not deployed yet</Text></Descriptions.Item>
                                                    </Descriptions>
                                                </div>,
                                            },
                                        ]}
                                    />
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
                    <p><Text type="secondary">50% of the platform fees will be distributed to ACFI holders who have locked their tokens (Voting Lock model)</Text></p>
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
                        color: 'green',
                        dot: <CheckCircleOutlined />
                    },
                    {
                        children: (
                            <p><Text type="secondary">To be announced</Text><br />Curve stACME/WACME Early Liquidity Providers</p>
                        ),
                        color: 'gray',
                        dot: <ClockCircleOutlined />
                    },
                    ]}
                    style={{marginTop: 30}}
                />
            </Modal>
        </Router>
  );
};

export default AccumulatedFinance;
