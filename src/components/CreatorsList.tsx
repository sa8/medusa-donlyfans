import { FC } from 'react'
import useGlobalStore from '@/stores/globalStore'
import Post from './PostListing'
import { useAccount } from 'wagmi'
import Subscription from './Subscribe'
import CreateNewProfile from './CreateNewProfile'
import CreatorsSubscribedTo from './CreatorsSubscribedTo'
import { Link, BrowserRouter as Router } from 'react-router-dom'

const CreatorsList: FC = () => {
	const { address } = useAccount()
	const creators = useGlobalStore(state => state.creators)
	//const listOfCreators = creators.filter(creator => creator.)
	const uniqueCreators = Array.from(new Set(creators))
	const listCreators = uniqueCreators.map(creator => (
		//<CreatorsSubscribedTo key={creator.toString()} {...creator} />

		<li key={creator.creatorAddress}>{creator.creatorAddress.toString()}</li>
	))

	return (
		<>
			<h1 className="text-2xl font-mono font-light dark:text-white mt-10 mb-6">List of creators</h1>
			<Router>
				{creators.map(creator => (
					<li key={creator.creatorAddress}>
						<Link
							to={`user-profile/${creator?.creatorAddress.toString()}`}
							className="flex gap-2 mt-2 items"
						>
							{creator.creatorAddress.toString()}
						</Link>
					</li>
				))}
			</Router>
		</>
	)
}

export default CreatorsList
