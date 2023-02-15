import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

import { Layout, Button, Badge, Tooltip, Typography } from 'antd';

import { IconContext } from "react-icons";
import {
    RiHeartFill
} from 'react-icons/ri';

import Logo from './common/Logo';
import ScrollToTop from './common/ScrollToTop';

import Index from './accumulated/Index';

const { Header, Content, Footer } = Layout;
const { Text, Paragraph } = Typography;

const AccumulatedFinance = props => {

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
                <Button type="primary" size="large" className="connect-button" shape="round" style={{ marginRight: 10 }}>
                    <Tooltip title="ACFI token will be airdropped to Accumulated Finance early users">
                        ACFI Airdrop
                    </Tooltip>
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
    </Router>
  );
};

export default AccumulatedFinance;
