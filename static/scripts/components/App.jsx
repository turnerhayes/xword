import React     from "react";
import ReactDOM  from "react-dom";
import XWordGrid from "./XWordGrid";
import XPuz      from "xpuz";
import "styles.scss";


const Puzzle = XPuz.Puzzle;

function range(max) {
	return [...Array(max).keys()];
}

class XWordApp extends React.Component {
	state = {
		width: 10,
		height: 10,
	}

	generateEmptyPuzzle = (width, height) => {
		return range(height).map(
			() => range(width).map(
				() => ({})
			)
		);
	}

	handleSubmit = (event) => {
		event.preventDefault();

		this.setState({
			width: this.refs.width.valueAsNumber,
			height: this.refs.height.valueAsNumber,
		});
	}

	render() {
		return (
			<div className="xword-app">
				<form
					className="create-puzzle-form form-inline"
					action="/create"
					method="get"
					encType="application/www-form-urlencoded"
					onSubmit={this.handleSubmit}
				>
					<div className="form-group">
						<label>
							Width:
							<input
								type="number"
								name="width"
								ref="width"
								className="form-control input-small"
								min={1}
								max={99}
								step={1}
								required
								defaultValue={this.state.width}
							/>
						</label>
						<label>
							Height:
							<input
								type="number"
								name="height"
								ref="height"
								className="form-control input-small"
								min={1}
								max={99}
								step={1}
								required
								defaultValue={this.state.height}
							/>
						</label>
					</div>
					<button
						type="submit"
						className="submit-create-puzzle-form-button btn btn-primary"
					>Generate</button>
				</form>
				<XWordGrid width={this.state.width} height={this.state.height} />
			</div>
		);
	}
}

export default XWordApp;
