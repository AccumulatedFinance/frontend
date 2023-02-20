import React, { useEffect, useState } from 'react';

import {
  Row,
  Col,
  Typography,
  Collapse,
  Statistic,
  Tabs,
  Button,
  Alert,
  Tag,
  Descriptions,
  Form,
  Input,
  Divider
} from 'antd';

import CountUp from 'react-countup';

import { IconContext } from "react-icons";
import {
    RiPercentLine, RiFundsLine, RiDropLine, RiGiftLine, RiDropFill, RiMoneyDollarCircleFill, RiLock2Fill, RiErrorWarningLine
} from 'react-icons/ri';

import RPC from '../common/RPC';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

const Index = () => {

    const deadline = 1678060799000;
    const stakingAccount = "accumulated.acme/staking";
    const wacmeAddress = "0xDF4Ef6EE483953fE3B84ABd08C6A060445c01170";
    const nativeACMEStakingMin = 50000;
    const formatter = (value) => <CountUp end={value} duration={0.75} decimals={2} separator="," />;
    const formatterRounded = (value) => <CountUp end={value} duration={0.75} decimals={0} separator="," />;

    const [stakingTVL, setStakingTVL] = useState(0);

    const getStakingTVL = async () => {
        try {
            let params = {url: stakingAccount};
            const response = await RPC.request("query", params);
            if (response && response.data && response.data.balance) {
                setStakingTVL(response.data.balance);
            } else {
                throw new Error("Token account " + stakingAccount + " not found"); 
            }
        }
        catch(error) {
            setStakingTVL(-1);
        }
    }

    useEffect(() => {
      document.title = "Accumulated Finance";
      getStakingTVL();
    }, []);

    return (
    
        <div>
        <Row className="headline">
            <Col span={24}>
                <Title>ACME Liquid Staking</Title>
                <Title level={2}>Earn ACME staking rewards. Exit anytime.</Title>
                <Row gutter={[16,32]} justify="center" style={{marginTop: '60px', marginBottom: '15px'}}>
                    <Col xs={24} sm={8} md={7} lg={6} xl={5}>
                        <IconContext.Provider value={{ className: 'react-icons' }}><RiPercentLine /></IconContext.Provider>
                        <Statistic title="Staking APR" value={"..."} suffix={""} precision={0} />
                    </Col>
                    <Col xs={24} sm={8} md={7} lg={6} xl={5}>
                        <IconContext.Provider value={{ className: 'react-icons' }}><RiDropLine /></IconContext.Provider>
                        <Statistic title="Liquid Staking TVL" value={(stakingTVL/(10**8)).toFixed(8)} suffix={"ACME"} formatter={formatterRounded} />
                    </Col>
                    <Col xs={24} sm={8} md={7} lg={6} xl={5}>
                        <IconContext.Provider value={{ className: 'react-icons' }}><RiFundsLine /></IconContext.Provider>
                        <Statistic title="Rewards Paid to veACFI" value={0} suffix={"ACME"} precision={2} formatter={formatter} />
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row className="sections">
            <Col span={24}>
                <Collapse size="large" defaultActiveKey={['1']}>
                    <Panel header={<div>ACME Liquid Staking<IconContext.Provider value={{ className: 'react-icons react-icons-blue' }}><RiDropFill /></IconContext.Provider></div>} key="1">
                        <Alert message={
                            <div>
                                <Title level={5}><IconContext.Provider value={{ className: 'react-icons react-icons-green' }}><RiGiftLine /></IconContext.Provider> ACFI airdrop for early liquid stakers  <Tag color="#87d068" style={{verticalAlign: 'top', marginTop: 1}}>ACTIVE</Tag></Title>
                                <Paragraph>Stake ACME or WACME during the early bird staking period to participate in ACFI airdrop!</Paragraph>
                                <Countdown title="Early bird liquid staking ends in:" value={deadline} format="Dd HH:mm:ss" />
                            </div>
                        }
                        type="success" style={{marginBottom: 20}} />
                        <ul>
                            <li>Stake WACME <Text type="secondary">(on the Ethereum network)</Text> or ACME <Text type="secondary">(on the Accumulate network)</Text>, get stACME</li>
                            <li>stACME staked in the staking smart contract earns ACME staking rewards every week</li>
                            <li>Convert stACME to WACME anytime via stACME/WACME Curve pool <Text type="secondary">(to be deployed in March 2023)</Text></li>
                            <li>Convert stACME to ACME via Accumulate Unstaking Process <Text type="secondary">(available in May 2023)</Text></li>
                        </ul>
                        <Tabs
                            defaultActiveKey="1"
                                items={[
                                {
                                    label: 'ACME to stACME',
                                    key: '1',
                                    children: <Alert message={
                                        <div>
                                            <Title level={5}>Stake ACME</Title>
                                            <Paragraph>
                                                Stake native ACME by sending tokens to our staking account on the Accumulate network<br />
                                                <strong><IconContext.Provider value={{ className: 'react-icons react-icons-blue' }}><RiErrorWarningLine /></IconContext.Provider> Minimum staking amount: {nativeACMEStakingMin.toLocaleString()} ACME</strong>
                                            </Paragraph>
                                            <Descriptions layout="vertical" column={1}>
                                                <Descriptions.Item label="ACME token account"><Text copyable>{stakingAccount}</Text></Descriptions.Item>
                                                <Descriptions.Item label="Tx memo"><Text mark>Your ETH address</Text></Descriptions.Item>
                                            </Descriptions>
                                        </div>
                                    }
                                    type="info" style={{marginBottom: 0}} />,
                                },
                                {
                                    label: 'WACME to stACME',
                                    key: '2',
                                    children: <Alert message={
                                        <div>
                                            <Title level={5}>Stake WACME</Title>
                                            <Paragraph>
                                                Stake wrapped ACME on the Ethereum network<br />
                                                <strong><IconContext.Provider value={{ className: 'react-icons react-icons-blue' }}><RiErrorWarningLine /></IconContext.Provider> No minimum staking amount</strong>
                                            </Paragraph>
                                            <Form
                                                layout="horizontal"
                                                style={{ maxWidth: 400 }}
                                                size={"large"}
                                                >
                                                <Form.Item>
                                                    <Input.Group compact>
                                                        <Input style={{ width: 'calc(100% - 100px)' }} placeholder='WACME amount to stake' />
                                                        <Button type="primary">Stake</Button>
                                                    </Input.Group>
                                                </Form.Item>
                                                <Form.Item>
                                                <Text mark>Liquid staking contract is being tested and deployed.<br />Please come back soon.</Text>
                                                </Form.Item>
                                            </Form>
                                            <Divider style={{margin: "10px 0"}} />
                                            <Descriptions layout="vertical" column={1}>
                                                <Descriptions.Item label="WACME contract"><a href={"https://etherscan.io/token/" + wacmeAddress} target="_blank" rel="noreferrer"><Text copyable>{wacmeAddress}</Text></a></Descriptions.Item>
                                                <Descriptions.Item label="stACME contract"><Text mark>To be deployed</Text></Descriptions.Item>
                                                <Descriptions.Item label="Liquid staking contract"><Text mark>To be deployed</Text></Descriptions.Item>
                                            </Descriptions>
                                        </div>
                                    }
                                    type="info" style={{marginBottom: 0}} />,
                                },
                                {
                                    label: 'stACME to ACME',
                                    key: '3',
                                    disabled: true,
                                },
                                {
                                    label: 'Stake stACME',
                                    key: '4',
                                    disabled: true,
                                },
                            ]}
                        />
                    </Panel>
                </Collapse>
                <Collapse size="large">
                    <Panel header={<div>Curve stACME/WACME Yield Farming<IconContext.Provider value={{ className: 'react-icons react-icons-green' }}><RiMoneyDollarCircleFill /></IconContext.Provider></div>} key="1">
                        <ul>
                            <li>Provide liquidity into stACME/WACME Curve pool, get WACME rewards</li>
                        </ul>
                        <Tabs
                            defaultActiveKey="1"
                                items={[
                                {
                                    label: 'Curve pool',
                                    key: '1',
                                    children: <div>
                                        <Button type="primary" disabled>Curve pool deployment soon</Button>
                                    </div>,
                                },
                                {
                                    label: 'Claim rewards',
                                    key: '2',
                                    disabled: true,
                                },
                            ]}
                        />
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
                        <Tabs
                            defaultActiveKey="1"
                                items={[
                                {
                                    label: 'Lock ACFI',
                                    key: '1',
                                    children: <div>
                                        <Button type="primary" disabled>ACFI token launch soon</Button>
                                    </div>,
                                },
                                {
                                    label: 'Stake veACFI',
                                    key: '2',
                                    disabled: true,
                                },
                                {
                                    label: 'Claim rewards',
                                    key: '3',
                                    disabled: true,
                                },
                            ]}
                        />
                    </Panel>
                </Collapse>
            </Col>
        </Row>
        </div>
    
    );
};

export default Index;
