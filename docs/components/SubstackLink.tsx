export default function SubstackLink() {
  return (
    <div className="substack-link-wrap">
      <span className="substack-link-icon" aria-hidden>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          imageRendering="optimizeQuality"
          fillRule="evenodd"
          clipRule="evenodd"
          viewBox="0 0 448 511.471"
          width={20}
          height={20}
        >
          <path
            fill="#FF681A"
            d="M0 0h448v62.804H0V0zm0 229.083h448v282.388L223.954 385.808 0 511.471V229.083zm0-114.542h448v62.804H0v-62.804z"
          />
        </svg>
      </span>
      <span>
        Find us on{' '}
        <a href="https://openaudio.substack.com/" className="substack-link">
          Substack
        </a>
      </span>
    </div>
  )
}
