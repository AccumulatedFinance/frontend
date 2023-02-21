import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

import { Layout, Button, Badge, Modal, Typography, Timeline, Divider } from 'antd';

import { IconContext } from "react-icons";
import {
    RiHeartFill
} from 'react-icons/ri';

import Logo from './common/Logo';
import LogoToken from './common/LogoToken';
import ScrollToTop from './common/ScrollToTop';

import Index from './accumulated/Index';

const { Header, Content, Footer } = Layout;
const { Text, Paragraph, Title } = Typography;

const AccumulatedFinance = props => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleOk = () => {
        setIsModalOpen(false);
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <Router>
            <ScrollToTop />
            <Layout>

                <Header>
                    <Link to="/">
                        <Logo />
                    </Link>
                    <Button disabled size="large" className="connect-button" shape="round">
                        <Badge color={"blue"} text="" />Connect Wallet
                    </Button>
                    <Button type="primary" ghost size="large" className="connect-button" shape="round" style={{ marginRight: 10 }} onClick={showModal}>
                        ACFI Airdrop
                    </Button>
                </Header>

                <Content style={{ padding: '25px 20px 30px 20px', margin: 0 }}>
                    <Routes>
                        <Route index element={<Index />} />
                    </Routes>
                </Content>

                <Footer>
                    <Paragraph>
                        <Text><strong>&copy; {new Date().getFullYear()} Accumulated Finance</strong></Text>
                        <br />
                        <Text className={"made-by"}>Made with <IconContext.Provider value={{ className: 'react-icons' }}><RiHeartFill /> by <a href="https://twitter.com/defacto_team" target="_blank" rel="noreferrer">De Facto</a></IconContext.Provider></Text>
                    </Paragraph>
                </Footer>

            </Layout>
            <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={2} style={{marginBottom: 5}}><LogoToken />ACFI</Title>
                    <Title level={5} style={{marginTop: 0, marginBottom: 20, fontWeight: 400}}>Accumulated Finance Governance Token</Title>
                    <p><Text type="secondary">50% of the platform fees will be distributed to ACFI holders who have locked their tokens (Voting Escrow model)</Text></p>
                </div>
                <Divider />
                <Title level={4}>Participate in ACFI Airdrop</Title>
                <Timeline
                    pending="To be continued..."
                    items={[
                    {
                        children: (
                            <p><Text type="secondary">February 20 – March 5</Text><br />ACME Liquid Staking Early Users</p>
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
