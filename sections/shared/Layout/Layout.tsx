import { FC, ReactNode, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import i18n from 'i18n';

import { zIndex } from 'constants/ui';
import media from 'styles/media';

import { languageState } from 'store/app';
import { isL2State } from 'store/wallet';
import { SPACE_KEY } from 'constants/snapshot';
import { Proposal } from 'queries/gov/types';
import useProposals from 'queries/gov/useProposals';
import { NotificationTemplate, userNotificationState } from 'store/ui';

type LayoutProps = {
	children: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
	const language = useRecoilValue(languageState);
	const isL2 = useRecoilValue(isL2State);

	const councilProposals = useProposals(SPACE_KEY.COUNCIL);
	const setNotificationState = useSetRecoilState(userNotificationState);

	useEffect(() => {
		i18n.changeLanguage(language);
	}, [language]);

	useEffect(() => {
		if (councilProposals.data && !isL2) {
			let latestProposal = {
				msg: {
					payload: {
						snapshot: '0',
					},
				},
			} as Partial<Proposal>;

			councilProposals.data.forEach((proposal) => {
				if (
					parseInt(proposal.msg.payload.snapshot) >
					parseInt(latestProposal?.msg?.payload.snapshot ?? '0')
				) {
					latestProposal = proposal;
				}
			});

			if (new Date().getTime() / 1000 < (latestProposal?.msg?.payload.end ?? 0)) {
				setNotificationState({
					type: 'info',
					template: NotificationTemplate.ELECTION,
					props: {
						proposal: latestProposal?.msg?.payload.name,
						link: `${latestProposal.msg?.space}/${latestProposal.authorIpfsHash}`,
					},
				});
			}
		}
	}, [councilProposals, setNotificationState, isL2]);

	return (
		<>
			<GlobalStyle />
			{children}
		</>
	);
};

const GlobalStyle = createGlobalStyle`
  body {
		background-color: ${(props) => props.theme.colors.black};
		color: ${(props) => props.theme.colors.white}
  }

  .bn-notify-custom {
		&& {
			font-family: ${(props) => props.theme.fonts.regular};
		}
	}
	/* blocknative onboard style overrides */
	.bn-onboard-custom {
		&&& {
			font-family: ${(props) => props.theme.fonts.regular};
			color: ${(props) => props.theme.colors.white};

		}
		&&.bn-onboard-modal {
			z-index: ${zIndex.DIALOG_OVERLAY};
			background: rgba(0, 0, 0, 0.8);
			${media.lessThan('sm')`
				align-items: flex-start;
			`};
		}
		&&.bn-onboard-modal-content-header-icon {
			background: none;
		}
		&&.bn-onboard-selected-wallet {
			background-color: ${(props) => props.theme.colors.grayBlue};
			color: ${(props) => props.theme.colors.white};
		}
		&&.bn-onboard-modal-content {
			background-color: ${(props) => props.theme.colors.navy};
			${media.lessThan('sm')`
				height: 100%;
			`};
		}
		&&.bn-onboard-select-wallet-info {
			cursor: pointer;
			color: ${(props) => props.theme.colors.white};
		}
		&&.bn-onboard-dark-mode-background-hover {
			&:hover {
				background-color: ${(props) => props.theme.colors.grayBlue};
			}
		}
		&&.bn-onboard-prepare-button {
			border-radius: 2px;
			color: ${(props) => props.theme.colors.white} ;
			background-color: ${(props) => props.theme.colors.navy} ;
			border: 1px solid ${(props) => props.theme.colors.grayBlue} ;
		}
		.bn-onboard-clickable {
			color: ${(props) => props.theme.colors.white} !important;
		}
	}
`;

export default Layout;
