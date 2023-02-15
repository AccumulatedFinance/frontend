import React, { useEffect } from 'react';

import {
  Row,
  Col,
  Typography,
  Collapse,
  Statistic,
  Tabs,
  Button,
  Alert
} from 'antd';

import CountUp from 'react-countup';

import { IconContext } from "react-icons";
import {
    RiPercentLine, RiFundsLine, RiDropLine, RiGiftLine, RiDropFill, RiMoneyDollarCircleFill, RiLock2Fill
} from 'react-icons/ri';

const { Panel } = Collapse;
const { Title, Text } = Typography;
const { Countdown } = Statistic;

const Index = () => {

    const deadline = 1676923200000;
    const formatter = (value) => <CountUp end={value} duration={0.75} decimals={2} separator="," />;
    const formatterRounded = (value) => <CountUp end={value} duration={0.75} decimals={0} separator="," />;

    useEffect(() => {
      document.title = "Accumulated Finance";
    }, []);

    return (
    
        <div>
        <Row className="headline">
            <Col span={24}>
                <Title>ACME Liquid Staking</Title>
                <Title level={2}>Earn ACME staking rewards. Exit anytime.<br />Launch soon.</Title>
                <Row gutter={[16,32]} justify="center" style={{marginTop: '60px', marginBottom: '15px'}}>
                    <Col xs={24} sm={8} md={7} lg={6} xl={5}>
                        <IconContext.Provider value={{ className: 'react-icons' }}><RiPercentLine /></IconContext.Provider>
                        <Statistic title="Staking APR" value={32.36} suffix={"%"} precision={2} formatter={formatter} />
                    </Col>
                    <Col xs={24} sm={8} md={7} lg={6} xl={5}>
                        <IconContext.Provider value={{ className: 'react-icons' }}><RiDropLine /></IconContext.Provider>
                        <Statistic title="Liquid Staking TVL" value={500000} suffix={"ACME"} formatter={formatterRounded} />
                    </Col>
                    <Col xs={24} sm={8} md={7} lg={6} xl={5}>
                        <IconContext.Provider value={{ className: 'react-icons' }}><RiFundsLine /></IconContext.Provider>
                        <Statistic title="veACFI Revenue" value={0} suffix={"ACME"} precision={2} formatter={formatterRounded} />
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row className="sections">
            <Col span={24}>
                <Collapse size="large" defaultActiveKey={['1']}>
                    <Panel header={<div>ACME Liquid Staking<IconContext.Provider value={{ className: 'react-icons react-icons-blue' }}><RiDropFill /></IconContext.Provider></div>} key="1">
                        <p>
                            <Alert message={
                                <div>
                                    <Title level={5}><IconContext.Provider value={{ className: 'react-icons react-icons-blue' }}><RiGiftLine /></IconContext.Provider> ACFI airdrop for early liquid stakers!</Title>
                                    <Countdown title="Early bird liquid staking starts in:" value={deadline} format="Dd HH:mm:ss" />
                                </div>
                            }
                            type="info" />
                        </p>
                        <ul>
                            <li>Stake WACME <Text type="secondary">(on the Ethereum network)</Text> or ACME <Text type="secondary">(on the Accumulate network)</Text>, get stACME</li>
                            <li>stACME earns ACME staking rewards</li>
                            <li>Exit stACME anytime via stACME/WACME Curve pool</li>
                        </ul>
                        <Tabs
                            defaultActiveKey="1"
                                items={[
                                {
                                    label: 'WACME to stACME',
                                    key: '1',
                                    children: <div>
                                        <Button type="primary" disabled>Liquid staking launch soon</Button>
                                    </div>,
                                },
                                {
                                    label: 'stACME to WACME',
                                    key: '2',
                                    disabled: true,
                                },
                                {
                                    label: 'Stake stACME',
                                    key: '3',
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
                            <li>ACFI is Accumulate Finance token</li>
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
