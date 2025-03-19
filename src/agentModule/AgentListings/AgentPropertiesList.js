/** @format */
import React from "react";
import styled from "styled-components";

/**
 * PROPS:
 * - properties: array of property objects
 * - onPropertyClick: function(property) => void
 */
const AgentPropertiesList = ({ properties, onPropertyClick }) => {
	const hasRealLocation = (prop) => {
		if (!prop.location) return false;
		if (!Array.isArray(prop.location.coordinates)) return false;
		const [lng, lat] = prop.location.coordinates;
		if ((lng === 0 && lat === 0) || (lng === 78.9629 && lat === 20.5937)) {
			return false;
		}
		return true;
	};

	const renderYesNoTd = (condition) => {
		return condition ? (
			<td className='yesCell'>Yes</td>
		) : (
			<td className='noCell'>No</td>
		);
	};

	return (
		<TableWrapper>
			<table className='myStyledTable'>
				<thead>
					<tr>
						<th style={{ width: "50px" }}>#</th>
						<th style={{ minWidth: "120px" }}>Property Name</th>
						<th>State</th>
						<th>City</th>
						<th>Active?</th>
						<th>Location?</th>
						<th>Property Photos</th>
						<th># of Rooms</th>
						<th>Rooms w/ Photos</th>
						<th>Created On</th>
						<th>Update</th>
					</tr>
				</thead>
				<tbody>
					{properties && properties.length > 0 ? (
						properties.map((prop, index) => {
							const isLocationOk = hasRealLocation(prop);
							const hasPhotos = prop.propertyPhotos?.length || 0;
							const roomsCount = prop.roomCountDetails?.length || 0;
							const roomsWithPhotos = prop.roomCountDetails
								? prop.roomCountDetails.filter(
										(r) => r.photos && r.photos.length > 0
									).length
								: 0;

							// parse creation date
							const createdDate = new Date(prop.createdAt);
							const createdDateStr = isNaN(createdDate.getTime())
								? "—"
								: createdDate.toLocaleDateString();

							return (
								<tr
									key={prop._id}
									onClick={() => onPropertyClick && onPropertyClick(prop)}
								>
									<td>{index + 1}</td>
									<td>{prop.propertyName || "—"}</td>
									<td>{prop.propertyState || "—"}</td>
									<td>{prop.propertyCity || "—"}</td>
									{renderYesNoTd(prop.activeProperty)}
									{renderYesNoTd(isLocationOk)}
									<td>
										{hasPhotos > 0 ? (
											<span className='yesCellInline'>
												{hasPhotos} photo(s)
											</span>
										) : (
											<span className='noCellInline'>No photos</span>
										)}
									</td>
									<td>{roomsCount}</td>
									<td>{roomsWithPhotos}</td>
									<td>{createdDateStr}</td>
									<td style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
										Update Property...
									</td>
								</tr>
							);
						})
					) : (
						<tr>
							<td colSpan='10'>
								<em>No properties found.</em>
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</TableWrapper>
	);
};

export default AgentPropertiesList;

const TableWrapper = styled.div`
	margin-top: 1rem;

	td {
		font-size: 0.75rem;
	}
	th {
		font-size: 0.85rem;
	}

	.myStyledTable {
		width: 100%;
		border-collapse: collapse;
		background: var(--mainWhite);
		color: var(--text-color-dark);
		font-size: 0.95rem;

		thead {
			background: var(--neutral-light2);
			tr th {
				padding: 0.75rem;
				border: 1px solid var(--border-color-light);
				text-align: left;
				font-weight: bold;
			}
		}

		tbody {
			tr {
				border-bottom: 1px solid var(--border-color-light);
				transition: var(--main-transition);
				cursor: pointer; /* Show pointer on hover */

				&:hover {
					background: var(--neutral-light3);
				}

				td {
					padding: 0.75rem;
					border: 1px solid var(--border-color-light);
					vertical-align: middle;
				}
			}
		}
	}

	.yesCell {
		color: #2e7d32;
		font-weight: bold;
		background: var(--mainWhite);
		text-align: center;
	}

	.noCell {
		background: #ffe5e5;
		color: #d8000c;
		font-weight: bold;
		text-align: center;
	}

	.yesCellInline {
		color: #2e7d32;
		font-weight: bold;
	}

	.noCellInline {
		background: #ffe5e5;
		color: #d8000c;
		font-weight: bold;
		padding: 3px 6px;
		border-radius: 4px;
	}
`;
