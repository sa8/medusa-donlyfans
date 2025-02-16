import { FC, useEffect, useState } from 'react'
import Image from 'next/image'
import useGlobalStore, { Request } from '@/stores/globalStore'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { Base64 } from 'js-base64'
import { ipfsGatewayLink } from '@/lib/utils'
import { useSigner } from 'wagmi'

const Unlocked: FC<Request> = ({ subscriber, creator, requestId, cipherId }) => {
	const medusa = useGlobalStore(state => state.medusa)
	const { data: signer, isSuccess: isSignerLoaded } = useSigner()

	const posts = useGlobalStore(state => state.posts)
	const decryptions = useGlobalStore(state => state.decryptions)

	const post = posts.find(post => post.cipherId.eq(cipherId))
	const decryption = decryptions.find(d => d.requestId.eq(requestId))

	const [plaintext, setPlaintext] = useState('Sign in to decrypt this secret')
	const [downloadLink, setDownloadLink] = useState('')

	useEffect(() => {
		const decryptContent = async () => {
			if (!decryption || !signer || !medusa?.keypair) return

			const { ciphertext } = decryption

			console.log('Downloading encrypted content from ipfs')
			const ipfsDownload = ipfsGatewayLink(post.uri)
			const response = await fetch(ipfsDownload)
			const encryptedContents = Base64.toUint8Array(await response.text())

			try {
				const decryptedBytes = await medusa.decrypt(ciphertext, encryptedContents)
				const msg = new TextDecoder().decode(decryptedBytes)
				setPlaintext(msg)
				if (isFile(msg)) {
					const fileData = msg.split(',')[1]
					setDownloadLink(window.URL.createObjectURL(new Blob([Base64.toUint8Array(fileData)])))
				} else {
					setDownloadLink(window.URL.createObjectURL(new Blob([msg])))
				}
			} catch (e) {
				setPlaintext('Decryption failed')
			}
		}
		decryptContent()
	}, [decryption, post.uri, isSignerLoaded, medusa?.keypair])

	const isFile = (data: string) => {
		return data.startsWith('data:')
	}

	const isImage = (data: string): Boolean => {
		return data.startsWith('data:image')
	}

	return (
		<div className="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
			<h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
				{post.name}
			</h5>
			<p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{post.description}</p>
			{/* <p className="mb-3">{BigNumber.from(0).eq(post.price) ? 'Free' : `${formatEther(post.price)} ETH`} </p> */}
			<a
				href={downloadLink}
				download={post.name}
				className="inline-flex items-center text-blue-600 hover:underline"
			>
				Download
				<svg
					className="ml-2 w-5 h-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
					<path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
				</svg>
			</a>

			<a
				href={ipfsGatewayLink(post.uri)}
				target="_blank"
				className="inline-flex items-center text-blue-600 hover:underline"
				rel="noreferrer"
			>
				View Encrypted on IPFS
				<svg
					className="ml-2 w-5 h-5"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
					<path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
				</svg>
			</a>
			{plaintext && isImage(plaintext) ? (
				<Image src={plaintext} width={300} height={300} alt="Decrypted Image" />
			) : (
				<textarea
					readOnly
					disabled
					className="form-textarea mt-1 block w-full h-24 dark:bg-gray-800 dark:text-white"
					rows={3}
					placeholder="Encrypted Content"
					value={plaintext}
				/>
			)}
		</div>
	)
}

export default Unlocked
