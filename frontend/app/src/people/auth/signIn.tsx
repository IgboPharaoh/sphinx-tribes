import React, { useState, useEffect } from 'react';
import { useObserver } from 'mobx-react-lite';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { AuthProps } from 'people/interfaces';
import { SOCKET_MSG, createSocketInstance } from 'config/socket';
import { useStores } from '../../store';
import { Divider } from '../../components/common';
import IconButton from '../../components/common/icon_button';
import { useIsMobile } from '../../hooks';
import QR from '../utils/QR';
import AuthQR from './authQR';
import SphinxAppLoginDeepLink from './SphinxAppLoginDeepLink';

export default observer(SignIn);

function SignIn(props: AuthProps) {
  const { main, ui } = useStores();
  const [page, setPage] = useState('sphinx');
  const [showSignIn, setShowSignIn] = useState(false);

  function redirect() {
    const el = document.createElement('a');
    el.target = '_blank';
    el.href = 'https://sphinx.chat/';
    el.click();
  }

  const isMobile = useIsMobile();

  useEffect(() => {
    main.getLnAuth();
  }, []);

  const onHandle = (event: any) => {
    const res = JSON.parse(event.data);
    if (res.msg === SOCKET_MSG.user_connect) {
      const user = ui.meInfo;
      if (user) {
        user.websocketToken = res.body;
        ui.setMeInfo(user);
      }
    } else if (res.msg === SOCKET_MSG.lnauth_success && res.k1 === main.lnauth.k1) {
      if (res.status) {
        ui.setShowSignIn(false);

        main.setLnAuth({ encode: '', k1: '' });
        main.setLnToken(res.jwt);
        ui.setMeInfo({ ...res.user, jwt: res.jwt });
      }
    }
  };

  useEffect(() => {
    const socket: WebSocket = createSocketInstance();
    socket.onopen = () => {
      console.log('Socket connected');
    };

    socket.onmessage = (event: MessageEvent) => {
      onHandle(event);
    };

    socket.onclose = () => {
      console.log('Socket disconnected');
    };
  }, []);

  return useObserver(() => (
    <div>
      {showSignIn ? (
        <Column>
          <SphinxAppLoginDeepLink />
        </Column>
      ) : (
        <>
          <Column>
            {isMobile && <Imgg src={'/static/sphinx.png'} />}

            <Name>Welcome</Name>

            <Description>
              {page === 'lnurl'
                ? 'Scan the QR code, to login with your LNURL auth enabled wallet.'
                : 'Use Sphinx to login and create or edit your profile.'}
            </Description>

            {page === 'lnurl' ? (
              <QR value={main.lnauth.encode} size={200} />
            ) : (
              !isMobile && (
                <AuthQR
                  onSuccess={() => {
                    if (props.onSuccess) props.onSuccess();
                    main.getPeople({ resetPage: true });
                  }}
                  style={{ marginBottom: 20 }}
                />
              )
            )}

            {page !== 'lnurl' && (
              <IconButton
                text={'Login with Sphinx'}
                height={48}
                endingIcon={'exit_to_app'}
                width={210}
                style={{ marginTop: 20 }}
                color={'primary'}
                onClick={() => setShowSignIn(true)}
                hovercolor={'#5881F8'}
                activecolor={'#5078F2'}
                shadowcolor={'rgba(97, 138, 255, 0.5)'}
              />
            )}

            {page === 'lnurl' ? (
              <IconButton
                text={'Back'}
                height={48}
                endingIcon={'login'}
                width={210}
                style={{ marginTop: 20 }}
                color={'primary'}
                onClick={() => setPage('sphinx')}
                hovercolor={'#5881F8'}
                activecolor={'#5078F2'}
                shadowcolor={'rgba(97, 138, 255, 0.5)'}
              />
            ) : (
              !isMobile && (
                <IconButton
                  text={'Login with LNAUTH'}
                  height={48}
                  endingIcon={'login'}
                  width={210}
                  style={{ marginTop: 20 }}
                  color={'primary'}
                  onClick={() => {
                    setPage('lnurl');
                  }}
                  hovercolor={'#5881F8'}
                  activecolor={'#5078F2'}
                  shadowcolor={'rgba(97, 138, 255, 0.5)'}
                />
              )
            )}
          </Column>
          <Divider />
          <Column style={{ paddingTop: 0 }}>
            <Description>I don't have Sphinx!</Description>
            <IconButton
              text={'Get Sphinx'}
              endingIcon={'launch'}
              width={210}
              height={48}
              buttonType={'text'}
              style={{ color: '#83878b', marginTop: '10px', border: '1px solid #83878b' }}
              onClick={() => redirect()}
              hovercolor={'#fff'}
              activecolor={'#fff'}
              textStyle={{
                color: '#000',
                fontSize: '16px',
                fontWeight: '600'
              }}
            />
          </Column>
        </>
      )}
    </div>
  ));
}

interface ImageProps {
  readonly src: string;
}

const Name = styled.div`
  font-style: normal;
  font-weight: 500;
  font-size: 26px;
  line-height: 19px;
  font-family: Barlow;
  /* or 73% */

  text-align: center;

  /* Text 2 */

  color: #292c33;
`;

const Description = styled.div`
  font-size: 17px;
  line-height: 20px;
  text-align: center;
  margin: 20px 0;
  font-family: Barlow;

  /* Main bottom icons */

  color: #5f6368;
`;

const Column = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 25px;
`;
const Imgg = styled.div<ImageProps>`
  background-image: url('${(p: any) => p.src}');
  background-position: center;
  background-size: cover;
  margin-bottom: 20px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  position: relative;
`;
